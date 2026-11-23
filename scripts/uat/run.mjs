/**
 * Operator-assisted E2E runner: drives YAML suites in tests/manual/a2ui/
 * against the real A2UI fence renderer mounted in the screenshot harness.
 *
 * Every interaction is a real DOM event: a slider is clicked and moved with
 * keyboard events, a button is clicked at its own box, and text is typed into
 * the focused field. No suite calls a component's internals.
 *
 * Assertions: text, text_not, theme, diagnostic, button_blocked,
 * composer_exact, composer_empty, slider_value, input_value, checked,
 * selected, count, attr, style, popup_url, popup_count, visible, hit_test,
 * focused, no_page_errors.
 *
 * `focused` takes `{ label }` and passes only when document.activeElement is
 * the text field whose visible label starts with that text. It fails with a
 * description of whatever does hold focus, so a run that loses focus names the
 * element that took it.
 *
 * `no_page_errors` takes `true` and passes only when nothing threw. The runner
 * records every `pageerror` and every console error for the whole suite, so the
 * assertion reports what arrived, not just the count. A failed subresource load
 * is a browser network diagnostic rather than an uncaught error, and the
 * network step already checks every request.
 *
 * `popup_count` takes `{ equals }` and counts the URLs recorded by the
 * window.open stub, so a refused openUrl proves zero calls.
 *
 * `attr` and `style` read exactly one element: a selector matching zero or
 * several fails the assertion with a count, so a test never passes on the
 * wrong node. `style` takes `{ selector, property, equals }` and compares the
 * computed value; the property may be written as `object-fit` or `objectFit`.
 *
 * Actions: click, type, type_focused, press, slider_to, toggle,
 * select_option, tab, modal_open, modal_close, source_toggle, push_stream,
 * fuzz, wait.
 *
 * `press` takes `{ key }` and sends one real key to the focused element, or to
 * the page when nothing is focused. The accepted keys are Tab, Shift+Tab,
 * Enter, Space, ArrowLeft, ArrowRight, Home and End. `type_focused` types into
 * whatever already has focus and never clicks, which is what lets a suite fill
 * a form with no mouse.
 *
 * `fuzz` takes `{ rounds, seed }` and touches the mounted surface the way a
 * reader would: a real click on a button, checkbox or chip, a click plus an
 * arrow press on a range input, or a click plus a few characters in a text
 * field. Targets are the visible, hit-testable controls inside the fence, so
 * the composer growing below the surface changes nothing. The seed drives a
 * fixed pseudo-random sequence, so the same seed picks the same controls and
 * the same keys on every run. It stops early only when the page throws, and it
 * then names the round and the control that threw.
 *
 * `push_stream` takes `{ code, status }` and hands it to the harness's
 * `window.__uatPushStream`. The fence keeps its mounted instance, so edits, the
 * open tab and the open modal survive, the way a second agent reply updates a
 * card in chat. The action waits until the pushed frame has rendered.
 *
 * An entry in `actions` may be `{ assert: <assertion> }`. It runs in place, so
 * a suite can check a partial stream, push the next reply, then check again.
 *
 * A step may set `viewport: { width, height }` to run at a chosen size. The
 * default is 1280x820; the screenshots at the end of a run always cover both
 * required sizes.
 *
 * The runner aborts every request that leaves the harness origin. A suite that
 * asserts a media element still needs Chrome to build the request, so it names
 * those exact URLs under `external:` at the suite level. Every declared URL is
 * still aborted before it leaves the machine, and any other external request
 * fails the run.
 *
 * `visible` takes `{ selector, min_height }` and requires the element to
 * exist, survive every clipping ancestor, sit fully inside the viewport, and
 * measure at least `min_height`. `hit_test` takes `{ selector, at: center }`
 * and requires `document.elementFromPoint` at the element's center to return
 * that element or one of its descendants.
 *
 * Usage:
 *   npm run uat
 *   npm run uat -- tests/manual/a2ui/uat-draw.yaml
 *
 * The runner uses the system Chrome, so nothing is downloaded. Set CHROME_PATH
 * when Chrome is not in the default place.
 */
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { parse } from "yaml";
import { freePort, startHarness } from "./harness.mjs";

const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const REPORT_DIR = fileURLToPath(new URL("../../docs/uat/", import.meta.url));
const SHOT_DIR = `${REPORT_DIR}shots/`;
const SUITE_DIR = fileURLToPath(new URL("../../tests/manual/a2ui/", import.meta.url));
const SCREENSHOT_VIEWPORTS = [
  { width: 1280, height: 820 },
  { width: 390, height: 844 },
];

// A UAT run loads the plugin's compiled CSS from dist. Without it every
// utility silently drops and the screenshots are evidence of nothing.
try {
  await access(`${REPO_ROOT}dist/app.css`);
} catch {
  throw new Error(
    "dist/app.css is missing: run `npm run build` before `npm run uat` (the harness loads the compiled stylesheet)",
  );
}

const requested = process.argv.slice(2).filter((argument) => !argument.startsWith("-"));
const suiteFiles =
  requested.length > 0
    ? requested
    : (await readdir(SUITE_DIR))
        .filter((name) => name.endsWith(".yaml"))
        .sort()
        .map((name) => `${SUITE_DIR}${name}`);

if (suiteFiles.length === 0) throw new Error(`no suites found in ${SUITE_DIR}`);

function harnessUrl(base, step, stream, theme) {
  const raw = step.goto ?? "?";
  const url = new URL(raw, base);
  url.searchParams.set("theme", theme);
  if (stream !== undefined) url.searchParams.set("code", stream);
  if (step.status !== undefined) url.searchParams.set("status", String(step.status));
  return url.toString();
}

async function applyTheme(page, theme) {
  await page.evaluate((value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
    document.documentElement.dataset.uatTheme = value;
  }, theme);
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
}

function stepViewport(step) {
  const wanted = step.viewport ?? SCREENSHOT_VIEWPORTS[0];
  const { width, height } = wanted;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error(
      `step ${JSON.stringify(step.id ?? "?")}: viewport needs positive integer width and height, got ${compact(wanted)}`,
    );
  }
  return { width, height, deviceScaleFactor: 1 };
}

async function waitForHarness(page) {
  await page.waitForSelector('[data-uat-ready="1"]', { timeout: 30_000 });
  await sleep(100);
}

function compact(value) {
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

const PRESS_KEYS = [
  "Tab",
  "Shift+Tab",
  "Enter",
  "Space",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
];

/** Mulberry32: a tiny seeded generator, so one seed repeats one sequence. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function readPressKey(payload) {
  const key = payload?.key;
  if (typeof key !== "string" || !PRESS_KEYS.includes(key)) {
    throw new Error(
      `press: key must be one of ${PRESS_KEYS.join(", ")}, got ${compact(key)}`,
    );
  }
  return key;
}

/** Where focus is now, in words a report can show. */
function focusedName(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof Element) || element === document.body) return "the page";
    const tag = element.tagName.toLowerCase();
    const own = (element.getAttribute("aria-label") ?? window.__uatText(element)).trim();
    if (own !== "") return `${tag} ${JSON.stringify(own)}`;
    const around = element.closest("label");
    const label = around === null ? "" : window.__uatText(around);
    if (label !== "") return `${tag} in ${JSON.stringify(label)}`;
    if (element instanceof HTMLInputElement) return `${tag}[type=${element.type}]`;
    return tag;
  });
}

/**
 * The visible, hit-testable controls a reader can reach on the mounted surface:
 * buttons, checkbox and chip options, range inputs and text fields. Anything
 * clipped, hidden, covered or parked outside the viewport is left out, so a
 * fuzz round only touches what a person could touch.
 */
function collectFuzzTargets(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-uat-fence]");
    if (root === null) return { missing: "fence" };
    const selector = [
      "button",
      '[role="checkbox"]',
      'input[type="range"]',
      'input[type="text"]',
      'input[type="number"]',
      'input[type="search"]',
      'input[type="email"]',
      'input[type="url"]',
      'input[type="tel"]',
      'input[type="password"]',
      "textarea",
    ].join(", ");
    const kindOf = (element) => {
      if (element instanceof HTMLInputElement && element.type === "range") return "range";
      if (element.getAttribute("role") === "checkbox") return "checkbox";
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return "text";
      return "button";
    };
    const targets = [];
    for (const element of root.querySelectorAll(selector)) {
      if (!(element instanceof HTMLElement)) continue;
      if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") continue;
      const words = (element.getAttribute("aria-label") ?? window.__uatText(element)).trim();
      // The source toggle swaps the surface for the raw stream, which would end
      // the run, so it is never a fuzz target.
      if (words === "Source" || words === "Hide source") continue;
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility !== "visible" || Number(style.opacity) === 0) {
        continue;
      }
      const point = window.__uatHitPoint(element);
      if (point === null) continue;
      if (point.x < 0 || point.y < 0 || point.x > innerWidth || point.y > innerHeight) continue;
      targets.push({
        kind: kindOf(element),
        words: (words === "" ? element.tagName.toLowerCase() : words).slice(0, 80),
        inputType: element instanceof HTMLInputElement ? element.type : null,
        point,
      });
    }
    return { targets };
  });
}

/**
 * Touch the mounted surface the way a reader would, for a fixed number of
 * rounds. The seed picks both the target and the key, so a run repeats. A page
 * error ends the fuzz at once with the round and the control named: the runner
 * reports a throw in the renderer, it never patches one.
 */
async function runFuzz(page, payload, state) {
  const rounds = payload?.rounds;
  const seed = payload?.seed;
  if (!Number.isInteger(rounds) || rounds <= 0) {
    throw new Error(`fuzz: rounds must be a positive integer, got ${compact(rounds)}`);
  }
  if (!Number.isInteger(seed)) {
    throw new Error(`fuzz: seed must be an integer, got ${compact(seed)}`);
  }
  const random = seededRandom(seed);
  const startedWith = state.pageErrors.length;
  const counts = { button: 0, checkbox: 0, range: 0, text: 0 };
  const typed = ["Ada", "7", "42", "Ok", "Zed"];
  let performed = 0;
  for (let round = 1; round <= rounds; round += 1) {
    const collected = await collectFuzzTargets(page);
    if (collected.missing !== undefined) {
      throw new Error("fuzz: no A2UI fence is mounted");
    }
    const targets = collected.targets;
    if (targets.length === 0) break;
    const target = targets[Math.floor(random() * targets.length)];
    counts[target.kind] += 1;
    const describe = `round ${round} of ${rounds}, ${target.kind} ${JSON.stringify(target.words)}`;
    await page.mouse.click(target.point.x, target.point.y);
    if (target.kind === "range") {
      await page.keyboard.press(random() < 0.5 ? "ArrowLeft" : "ArrowRight");
    } else if (target.kind === "text") {
      const word = typed[Math.floor(random() * typed.length)];
      const digits = word.replace(/\D/gu, "");
      const typedText = target.inputType === "number" ? (digits === "" ? "7" : digits) : word;
      await page.keyboard.type(typedText);
    }
    performed += 1;
    await sleep(40);
    if (state.pageErrors.length > startedWith) {
      const error = state.pageErrors[startedWith];
      throw new Error(
        `fuzz: the page threw on ${describe}: ${error.kind} ${JSON.stringify(error.message)}`,
      );
    }
  }
  if (performed < rounds) {
    throw new Error(
      `fuzz: only ${performed} of ${rounds} rounds found a visible control on the surface`,
    );
  }
  return `fuzz: ${performed} rounds, seed ${seed}, ${counts.button} button, ${counts.checkbox} checkbox, ${counts.range} range, ${counts.text} text`;
}

function actionLabel(action) {
  if (action?.press !== undefined) {
    const key = action.press?.key;
    return `press ${typeof key === "string" ? key : compact(key)}`;
  }
  if (action?.type_focused !== undefined) {
    return `type_focused ${JSON.stringify(action.type_focused?.text)}`;
  }
  if (action?.fuzz !== undefined) {
    return `fuzz ${compact(action.fuzz)}`;
  }
  return compact(action);
}

async function runAction(page, action, state) {
  if (action.press !== undefined) {
    const key = readPressKey(action.press);
    const before = await focusedName(page);
    await page.keyboard.press(key);
    await sleep(50);
    const after = await focusedName(page);
    return `press ${key}: focus moved from ${before} to ${after}`;
  }
  if (action.type_focused !== undefined) {
    const text = action.type_focused?.text;
    if (typeof text !== "string" || text === "") {
      throw new Error(`type_focused: text must be a non-empty string, got ${compact(text)}`);
    }
    const focused = await focusedName(page);
    if (focused === "the page") {
      throw new Error("type_focused: nothing is focused, so the text would go nowhere");
    }
    await page.keyboard.type(text);
    await sleep(100);
    return `type_focused ${JSON.stringify(text)} into ${focused}`;
  }
  if (action.fuzz !== undefined) {
    return runFuzz(page, action.fuzz, state);
  }

  if (action.slider_to !== undefined) {
    const { label, value } = action.slider_to;
    const info = await page.evaluate((wanted) => {
      const input = [...document.querySelectorAll("input[type=range]")].find((candidate) =>
        (candidate.closest("label")?.innerText ?? "").trim().startsWith(wanted),
      );
      if (!(input instanceof HTMLInputElement)) return null;
      const box = input.getBoundingClientRect();
      return {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
        min: Number(input.min === "" ? 0 : input.min),
        max: Number(input.max === "" ? 100 : input.max),
        step: Number(input.step === "" || input.step === "any" ? 1 : input.step),
        current: Number(input.value),
      };
    }, label);
    if (info === null) throw new Error(`slider_to: no range input labelled ${JSON.stringify(label)}`);
    if (value < info.min || value > info.max) {
      throw new Error(`slider_to: ${value} is outside ${info.min}..${info.max}`);
    }
    await page.mouse.click(info.x, info.y);
    await page.evaluate((wanted) => {
      const input = [...document.querySelectorAll("input[type=range]")].find((candidate) =>
        (candidate.closest("label")?.innerText ?? "").trim().startsWith(wanted),
      );
      if (input instanceof HTMLInputElement) input.focus();
    }, label);
    await page.keyboard.press("Home");
    const step = info.step > 0 ? info.step : 1;
    const presses = Math.round((value - info.min) / step);
    const key = presses >= 0 ? "ArrowRight" : "ArrowLeft";
    for (let index = 0; index < Math.abs(presses); index += 1) await page.keyboard.press(key);
    return;
  }
  if (action.click !== undefined) {
    const { text } = action.click;
    const info = await page.evaluate((label) => {
      const button = [...document.querySelectorAll("button")].find(
        (candidate) => (candidate.textContent ?? "").trim() === label,
      );
      if (button === undefined) return null;
      const box = button.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    }, text);
    if (info === null) throw new Error(`click: no button labelled ${JSON.stringify(text)}`);
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.type !== undefined) {
    const { label, text } = action.type;
    const info = await page.evaluate((wanted) => {
      const field = [...document.querySelectorAll("input, textarea")].find((candidate) => {
        const scope = candidate.closest("label")?.innerText ?? "";
        return scope.trim().startsWith(wanted);
      });
      if (field === undefined) return null;
      const box = field.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    }, label);
    if (info === null) throw new Error(`type: no field labelled ${JSON.stringify(label)}`);
    await page.mouse.click(info.x, info.y);
    await page.keyboard.type(text);
    await sleep(100);
    return;
  }
  if (action.toggle !== undefined) {
    const { label } = action.toggle;
    const info = await page.evaluate((wanted) => {
      const box = [...document.querySelectorAll('[role="checkbox"]')].find((candidate) =>
        window.__uatText(candidate.closest("label")).startsWith(wanted),
      );
      if (box === undefined) return null;
      return window.__uatHitPoint(box);
    }, label);
    if (info === null) throw new Error(`toggle: no checkbox labelled ${JSON.stringify(label)}`);
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.select_option !== undefined) {
    const { label, option } = action.select_option;
    const info = await page.evaluate(
      ({ wanted, wantedOption }) => {
        const fieldset = [...document.querySelectorAll("fieldset")].find((candidate) =>
          window.__uatText(candidate.querySelector("legend")).startsWith(wanted),
        );
        if (fieldset === undefined) return { missing: "fieldset" };
        const target = [...fieldset.querySelectorAll('button[aria-pressed], [role="checkbox"]')].find(
          (candidate) => {
            const text =
              candidate.getAttribute("aria-label") ??
              window.__uatText(candidate.closest("label") ?? candidate);
            return text.trim() === wantedOption;
          },
        );
        if (target === undefined) return { missing: "option" };
        return window.__uatHitPoint(target);
      },
      { wanted: label, wantedOption: option },
    );
    if (info === null || info.missing !== undefined) {
      throw new Error(
        `select_option: ${info?.missing === "fieldset" ? `no fieldset labelled ${JSON.stringify(label)}` : `no option ${JSON.stringify(option)} in ${JSON.stringify(label)}`}`,
      );
    }
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.tab !== undefined) {
    const { title } = action.tab;
    const info = await page.evaluate((wanted) => {
      const tab = [...document.querySelectorAll('button[role="tab"]')].find(
        (candidate) => window.__uatText(candidate) === wanted,
      );
      if (tab === undefined) return null;
      return window.__uatHitPoint(tab);
    }, title);
    if (info === null) throw new Error(`tab: no tab titled ${JSON.stringify(title)}`);
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.modal_open !== undefined) {
    const { trigger } = action.modal_open;
    const info = await page.evaluate((wanted) => {
      // The trigger text also lives on every wrapper above it. The smallest
      // box carrying that exact text is the innermost node, and a click there
      // bubbles through the trigger's own click handler.
      const boxes = [...document.querySelectorAll("[data-uat-fence] *")]
        .filter((candidate) => window.__uatText(candidate) === wanted)
        .map((candidate) => ({ candidate, rect: candidate.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && rect.height > 0)
        .sort(
          (left, right) =>
            left.rect.width * left.rect.height - right.rect.width * right.rect.height,
        );
      const innermost = boxes[0];
      if (innermost === undefined) return null;
      return window.__uatHitPoint(innermost.candidate);
    }, trigger);
    if (info === null) throw new Error(`modal_open: no trigger text ${JSON.stringify(trigger)}`);
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.modal_close !== undefined) {
    const info = await page.evaluate(() => {
      const close = document.querySelector('button[aria-label="Close"]');
      if (!(close instanceof Element)) return null;
      return window.__uatHitPoint(close);
    });
    if (info === null) throw new Error("modal_close: no button with aria-label Close");
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.source_toggle !== undefined) {
    const info = await page.evaluate(() => {
      const button = [...document.querySelectorAll("button")].find((candidate) => {
        const text = window.__uatText(candidate);
        return text === "Source" || text === "Hide source";
      });
      if (button === undefined) return null;
      return window.__uatHitPoint(button);
    });
    if (info === null) throw new Error('source_toggle: no button labelled Source or Hide source');
    await page.mouse.click(info.x, info.y);
    await sleep(100);
    return;
  }
  if (action.push_stream !== undefined) {
    const payload = action.push_stream;
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("push_stream: needs an object with code and an optional status");
    }
    const outcome = await page.evaluate(async (next) => {
      const push = window.__uatPushStream;
      if (typeof push !== "function") {
        return { error: "the harness exposes no __uatPushStream" };
      }
      try {
        await push(next);
        return { ok: true };
      } catch (cause) {
        return { error: cause instanceof Error ? cause.message : String(cause) };
      }
    }, payload);
    if (outcome.error !== undefined) throw new Error(`push_stream: ${outcome.error}`);
    await sleep(100);
    return;
  }
  if (action.wait !== undefined) {
    await sleep(Number(action.wait));
    return;
  }
  throw new Error(`unknown action ${compact(action)}`);
}

async function runAssertion(page, assertion, state) {
  if (assertion === null || typeof assertion !== "object" || Array.isArray(assertion)) {
    throw new Error(`an assertion needs a mapping with one key, got ${compact(assertion)}`);
  }
  const keys = Object.keys(assertion);
  // One key per entry, because the dispatcher below reads only the first key.
  if (keys.length !== 1) {
    throw new Error(
      `an assertion takes exactly one key, got ${compact(keys)}: put each check in its own entry`,
    );
  }
  const [key] = keys;
  const value = assertion[key];
  if (key === "no_page_errors") {
    if (value !== true) {
      throw new Error(`no_page_errors: the only value is true, got ${compact(value)}`);
    }
    const errors = state.pageErrors;
    return {
      ok: errors.length === 0,
      detail:
        errors.length === 0
          ? "no page errors and no console errors arrived"
          : `${errors.length} error(s) arrived: ${compact(
              errors.map((entry) => `${entry.kind} in ${entry.step}: ${entry.message}`),
            )}`,
    };
  }
  if (key === "text") {
    // A modal portals its panel to document.body, outside the app root, so the
    // page text has to be read from the body.
    const body = await page.evaluate(() => document.body.innerText ?? "");
    return { ok: body.includes(value), detail: `text ${JSON.stringify(value)} in the page` };
  }
  if (key === "text_not") {
    const body = await page.evaluate(() => document.body.innerText ?? "");
    return { ok: !body.includes(value), detail: `text ${JSON.stringify(value)} absent` };
  }
  if (key === "theme") {
    const expected = value.expected;
    const info = await page.evaluate(() => {
      const html = document.documentElement;
      const surface = document.querySelector("[data-uat-fence] > *");
      const luminance = (css) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        if (context === null) return null;
        context.fillStyle = "#000";
        context.fillStyle = css;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        const channel = (raw) => {
          const scaled = raw / 255;
          return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      return {
        dark: html.classList.contains("dark"),
        marked: html.dataset.uatTheme ?? null,
        background: getComputedStyle(document.body).backgroundColor,
        foreground: getComputedStyle(document.body).color,
        backgroundLuminance: luminance(getComputedStyle(document.body).backgroundColor),
        foregroundLuminance: luminance(getComputedStyle(document.body).color),
        surfaceBackground: surface === null ? null : getComputedStyle(surface).backgroundColor,
        surfaceLuminance:
          surface === null ? null : luminance(getComputedStyle(surface).backgroundColor),
      };
    });
    const dark = info.dark === true;
    const backgroundOk =
      info.backgroundLuminance !== null &&
      (expected === "dark" ? info.backgroundLuminance < 0.45 : info.backgroundLuminance > 0.55);
    const surfaceOk =
      info.surfaceLuminance !== null &&
      (expected === "dark" ? info.surfaceLuminance < 0.45 : info.surfaceLuminance > 0.55);
    const contrast =
      info.backgroundLuminance === null || info.foregroundLuminance === null
        ? 0
        : (Math.max(info.backgroundLuminance, info.foregroundLuminance) + 0.05) /
          (Math.min(info.backgroundLuminance, info.foregroundLuminance) + 0.05);
    const ok =
      dark === (expected === "dark") &&
      info.marked === expected &&
      backgroundOk &&
      surfaceOk &&
      contrast >= 4.5;
    return {
      ok,
      detail: `${expected} theme: html.dark=${dark}, marked=${info.marked}, background=${info.background}, surface=${info.surfaceBackground}, contrast=${contrast.toFixed(2)}:1`,
    };
  }
  if (key === "diagnostic") {
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll("[data-uat-fence] li")].map((row) => row.textContent ?? ""),
    );
    const wantedCode = value.code;
    const wantedMessage = value.message_contains;
    const match = rows.find((row) => row.trim().startsWith(wantedCode));
    const ok =
      match !== undefined &&
      (wantedMessage === undefined || match.includes(wantedMessage));
    return {
      ok,
      detail:
        match === undefined
          ? `diagnostic ${wantedCode} not shown (saw ${compact(rows)})`
          : `${wantedCode}: ${match.trim()}`,
    };
  }
  if (key === "button_blocked") {
    const info = await page.evaluate((label) => {
      const button = [...document.querySelectorAll("button")].find(
        (candidate) => (candidate.textContent ?? "").trim() === label,
      );
      return {
        found: button !== undefined,
        invalid: button?.getAttribute("aria-invalid") ?? null,
        alerts: [...document.querySelectorAll("[role=alert]")].map(
          (alert) => alert.textContent ?? "",
        ),
      };
    }, value.label);
    const messageOk =
      value.message === undefined ||
      info.alerts.some((alert) => alert.includes(value.message));
    const ok = info.found && info.invalid === "true" && messageOk;
    return {
      ok,
      detail: `button ${JSON.stringify(value.label)} aria-invalid=${info.invalid}, alerts=${compact(info.alerts)}`,
    };
  }
  if (key === "composer_exact") {
    const actual = await page.evaluate(
      () => document.querySelector("[data-uat-composer]")?.textContent ?? "",
    );
    return {
      ok: actual === value,
      detail:
        actual === value
          ? "composer text matches exactly"
          : `composer text differs: expected ${compact(value)}, got ${compact(actual)}`,
    };
  }
  if (key === "composer_empty") {
    const actual = await page.evaluate(
      () => document.querySelector("[data-uat-composer]")?.textContent ?? "",
    );
    return { ok: actual.trim() === "", detail: `composer text ${compact(actual)}` };
  }
  if (key === "slider_value") {
    const info = await page.evaluate((wanted) => {
      const input = [...document.querySelectorAll("input[type=range]")].find((candidate) =>
        (candidate.closest("label")?.innerText ?? "").trim().startsWith(wanted),
      );
      if (!(input instanceof HTMLInputElement)) return null;
      const shown = (input.closest("label")?.querySelector(".font-mono")?.textContent ?? "").trim();
      return { value: Number(input.value), shown };
    }, value.label);
    const ok =
      info !== null && info.value === Number(value.value) && info.shown === String(value.value);
    return {
      ok,
      detail:
        info === null
          ? `no slider labelled ${JSON.stringify(value.label)}`
          : `slider ${JSON.stringify(value.label)} value=${info.value}, shown=${JSON.stringify(info.shown)}`,
    };
  }
  if (key === "input_value") {
    const info = await page.evaluate((wanted) => {
      const field = [...document.querySelectorAll("input, textarea")].find((candidate) => {
        if (candidate instanceof HTMLInputElement && candidate.type === "range") return false;
        return (candidate.closest("label")?.innerText ?? "").trim().startsWith(wanted);
      });
      if (field === undefined) return null;
      return {
        type: field instanceof HTMLInputElement ? field.type : "textarea",
        value: field.value,
      };
    }, value.label);
    const ok = info !== null && info.value === String(value.value);
    return {
      ok,
      detail:
        info === null
          ? `no native input labelled ${JSON.stringify(value.label)}`
          : `input ${JSON.stringify(value.label)} (${info.type}) value=${JSON.stringify(info.value)}, expected ${JSON.stringify(String(value.value))}`,
    };
  }
  if (key === "checked") {
    const info = await page.evaluate((wanted) => {
      const box = [...document.querySelectorAll('[role="checkbox"]')].find((candidate) =>
        window.__uatText(candidate.closest("label")).startsWith(wanted),
      );
      if (box === undefined) return null;
      return {
        state: box.getAttribute("data-state") ?? box.getAttribute("aria-checked"),
      };
    }, value.label);
    const on = info !== null && (info.state === "checked" || info.state === "true");
    return {
      ok: info !== null && on === (value.value === true),
      detail:
        info === null
          ? `no checkbox labelled ${JSON.stringify(value.label)}`
          : `checkbox ${JSON.stringify(value.label)} state=${JSON.stringify(info.state)}`,
    };
  }
  if (key === "selected") {
    const info = await page.evaluate(
      ({ wanted, wantedOption }) => {
        let scope = document.querySelector("[data-uat-fence]");
        if (wanted !== undefined) {
          const fieldset = [...document.querySelectorAll("fieldset")].find((candidate) =>
            window.__uatText(candidate.querySelector("legend")).startsWith(wanted),
          );
          if (fieldset === undefined) return { missing: "fieldset" };
          scope = fieldset;
        }
        if (scope === null) return { missing: "surface" };
        const candidates = [...scope.querySelectorAll('button[aria-pressed], [role="checkbox"]')];
        const target = candidates.find((candidate) => {
          const text =
            candidate.getAttribute("aria-label") ??
            window.__uatText(candidate.closest("label") ?? candidate);
          return text.trim() === wantedOption;
        });
        if (target === undefined) {
          return {
            missing: "option",
            seen: candidates.map((candidate) =>
              (
                candidate.getAttribute("aria-label") ??
                window.__uatText(candidate.closest("label") ?? candidate)
              ).trim(),
            ),
          };
        }
        const pressed = target.getAttribute("aria-pressed");
        // A chip reports aria-pressed; a Radix checkbox reports data-state.
        const on = pressed !== null ? pressed === "true" : target.getAttribute("data-state") === "checked";
        return { on };
      },
      { wanted: value.label, wantedOption: value.option },
    );
    if (info.missing !== undefined) {
      const reason =
        info.missing === "fieldset"
          ? `no fieldset labelled ${JSON.stringify(value.label)}`
          : info.missing === "surface"
            ? "no A2UI surface is mounted"
            : `no option ${JSON.stringify(value.option)} (saw ${compact(info.seen ?? [])})`;
      return { ok: false, detail: reason };
    }
    return {
      ok: info.on === (value.value === true),
      detail: `option ${JSON.stringify(value.option)} ${info.on ? "selected" : "not selected"}`,
    };
  }
  if (key === "count") {
    const actual = await page.evaluate(
      (selector) => document.querySelectorAll(selector).length,
      value.selector,
    );
    return {
      ok: actual === Number(value.equals),
      detail: `${actual} element(s) match ${JSON.stringify(value.selector)}, expected ${value.equals}`,
    };
  }
  if (key === "attr") {
    const info = await page.evaluate(
      ({ selector, name }) => {
        const matches = [...document.querySelectorAll(selector)];
        return {
          count: matches.length,
          value: matches[0]?.getAttribute(name) ?? null,
        };
      },
      { selector: value.selector, name: value.name },
    );
    const ok = info.count === 1 && info.value === String(value.equals);
    return {
      ok,
      detail:
        info.count === 0
          ? `no element matches ${JSON.stringify(value.selector)}`
          : info.count > 1
            ? `${info.count} elements match ${JSON.stringify(value.selector)}, expected exactly one`
            : `attr ${value.name}=${JSON.stringify(info.value)} on ${JSON.stringify(value.selector)}, expected ${JSON.stringify(String(value.equals))}`,
    };
  }
  if (key === "style") {
    const info = await page.evaluate(
      ({ selector, property }) => {
        const matches = [...document.querySelectorAll(selector)];
        const cssProperty = property.includes("-")
          ? property
          : property.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
        return {
          count: matches.length,
          value:
            matches.length === 1
              ? getComputedStyle(matches[0]).getPropertyValue(cssProperty).trim()
              : null,
        };
      },
      { selector: value.selector, property: value.property },
    );
    const ok = info.count === 1 && info.value === String(value.equals);
    return {
      ok,
      detail:
        info.count === 0
          ? `no element matches ${JSON.stringify(value.selector)}`
          : info.count > 1
            ? `${info.count} elements match ${JSON.stringify(value.selector)}, expected exactly one`
            : `style ${value.property}=${JSON.stringify(info.value)} on ${JSON.stringify(value.selector)}, expected ${JSON.stringify(String(value.equals))}`,
    };
  }
  if (key === "focused") {
    const wanted = value.label;
    if (typeof wanted !== "string" || wanted === "") {
      throw new Error(`focused: label must be a non-empty string, got ${compact(wanted)}`);
    }
    const info = await page.evaluate((label) => {
      const field = [...document.querySelectorAll("input, textarea")].find((candidate) => {
        if (candidate instanceof HTMLInputElement && candidate.type === "range") return false;
        return (candidate.closest("label")?.innerText ?? "").trim().startsWith(label);
      });
      return {
        found: field !== undefined,
        focused: field !== undefined && document.activeElement === field,
      };
    }, wanted);
    const active = await focusedName(page);
    return {
      ok: info.found && info.focused,
      detail: !info.found
        ? `no field labelled ${JSON.stringify(wanted)}, focus is on ${active}`
        : info.focused
          ? `focus is in the field labelled ${JSON.stringify(wanted)}`
          : `focus is on ${active}, expected the field labelled ${JSON.stringify(wanted)}`,
    };
  }
  if (key === "popup_url") {
    const urls = await page.evaluate(() => window.__uatPopups ?? []);
    const last = urls.at(-1);
    return {
      ok: urls.length > 0 && last === value.equals,
      detail:
        urls.length === 0
          ? "window.open was never called"
          : `window.open received ${compact(urls)}, last ${JSON.stringify(last)}`,
    };
  }
  if (key === "popup_count") {
    const urls = await page.evaluate(() => window.__uatPopups ?? []);
    const expected = Number(value.equals);
    const ok = urls.length === expected;
    return {
      ok,
      detail: `window.open was called ${urls.length} time(s), expected ${expected}${
        urls.length === 0 ? "" : `: ${compact(urls)}`
      }`,
    };
  }
  if (key === "visible") {
    const minHeight = Number(value.min_height);
    if (!Number.isFinite(minHeight)) {
      throw new Error(`visible: min_height must be a number, got ${compact(value.min_height)}`);
    }
    const info = await page.evaluate(
      ({ selector, minHeight }) => {
        const describeNode = (node) => {
          const id = node.id === "" ? "" : `#${node.id}`;
          const label = node.getAttribute("aria-label");
          return `${node.tagName.toLowerCase()}${id}${label === null ? "" : `[aria-label=${JSON.stringify(label)}]`}`;
        };
        const clips = (overflow) => overflow !== "visible";
        const element = document.querySelector(selector);
        if (element === null) return { missing: true };
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (rect.width === 0 || rect.height === 0) {
          return { hidden: `the box measures ${rect.width}x${rect.height}` };
        }
        if (style.display === "none" || style.visibility !== "visible" || Number(style.opacity) === 0) {
          return {
            hidden: `display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}`,
          };
        }
        const clipped = [];
        for (let node = element.parentElement; node !== null; node = node.parentElement) {
          if (node === document.body || node === document.documentElement) break;
          const ancestorStyle = getComputedStyle(node);
          const box = node.getBoundingClientRect();
          const clipX = clips(ancestorStyle.overflowX);
          const clipY = clips(ancestorStyle.overflowY);
          const outX = rect.left < box.left - 0.5 || rect.right > box.right + 0.5;
          const outY = rect.top < box.top - 0.5 || rect.bottom > box.bottom + 0.5;
          if ((clipX && outX) || (clipY && outY)) {
            clipped.push({ ancestor: describeNode(node) });
          }
          // The nearest fixed ancestor is the containing block for everything
          // below it; further ancestors do not clip a fixed overlay.
          if (ancestorStyle.position === "fixed") break;
        }
        return {
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            height: rect.height,
          },
          viewport: { width: innerWidth, height: innerHeight },
          clipped,
          outside:
            rect.left < -0.5 ||
            rect.top < -0.5 ||
            rect.right > innerWidth + 0.5 ||
            rect.bottom > innerHeight + 0.5,
        };
      },
      { selector: value.selector, minHeight },
    );
    if (info.missing === true) {
      return { ok: false, detail: `no element matches ${JSON.stringify(value.selector)}` };
    }
    if (info.hidden !== undefined) {
      return { ok: false, detail: `element is not rendered: ${info.hidden}` };
    }
    const box = `${info.rect.left.toFixed(0)},${info.rect.top.toFixed(0)} ${(info.rect.right - info.rect.left).toFixed(0)}x${info.rect.height.toFixed(0)}`;
    const problems = [];
    if (info.rect.height < minHeight) {
      problems.push(`height ${info.rect.height.toFixed(0)} is under the ${minHeight} minimum`);
    }
    if (info.clipped.length > 0) {
      problems.push(`clipped by ${info.clipped.map((entry) => entry.ancestor).join(", ")}`);
    }
    if (info.outside) {
      problems.push(`box is outside the ${info.viewport.width}x${info.viewport.height} viewport`);
    }
    return {
      ok: problems.length === 0,
      detail:
        problems.length === 0
          ? `${JSON.stringify(value.selector)} is visible at ${box}, at least ${minHeight} tall and inside the viewport`
          : `${JSON.stringify(value.selector)} at ${box}: ${problems.join("; ")}`,
    };
  }
  if (key === "hit_test") {
    const at = value.at ?? "center";
    if (at !== "center") {
      throw new Error(`hit_test: at must be "center", got ${JSON.stringify(value.at)}`);
    }
    const info = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element === null) return { missing: true };
      const rect = element.getBoundingClientRect();
      const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const hit = document.elementFromPoint(point.x, point.y);
      const label = hit === null ? null : hit.getAttribute("aria-label");
      return {
        point,
        covered: hit !== null && (hit === element || element.contains(hit)),
        hit: hit === null ? null : `${hit.tagName.toLowerCase()}${label === null ? "" : `[aria-label=${JSON.stringify(label)}]`}`,
      };
    }, value.selector);
    if (info.missing === true) {
      return { ok: false, detail: `no element matches ${JSON.stringify(value.selector)}` };
    }
    const point = `${info.point.x.toFixed(0)},${info.point.y.toFixed(0)}`;
    return {
      ok: info.covered,
      detail:
        info.hit === null
          ? `nothing is painted at ${point}`
          : `${JSON.stringify(value.selector)} ${info.covered ? "is" : "is not"} the hit at ${point} (hit ${info.hit})`,
    };
  }
  throw new Error(`unknown assertion ${compact(assertion)}`);
}

async function runSuite(file, browser) {
  const source = await readFile(file, "utf8");
  const suite = parse(source);
  const name = (file.split("/").pop() ?? "suite").replace(/\.yaml$/u, "");
  const theme = suite.defaults?.theme ?? "dark";
  const steps = Array.isArray(suite.steps) ? suite.steps : [];
  const declaredExternal = new Set(
    (Array.isArray(suite.external) ? suite.external : []).map((url) => String(url)),
  );
  if (steps.length === 0) throw new Error(`${name}: suite has no steps`);

  const port = await freePort();
  const { child, base } = await startHarness(port);
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  // Capture the URL handed to window.open before the app loads, so an openUrl
  // button is checked without opening a tab or reaching the network. Also
  // install two DOM helpers the verbs share: visible label text (an icon
  // contributes no words) and a hit-tested point inside a control's box, so a
  // clipped or partly covered control is clicked where it is actually painted.
  await page.evaluateOnNewDocument(() => {
    window.__uatPopups = [];
    window.open = (url) => {
      window.__uatPopups.push(url === undefined || url === null ? "" : String(url));
      return null;
    };
    window.__uatText = (element) => {
      if (element === null || element === undefined) return "";
      const clone = element.cloneNode(true);
      clone.querySelectorAll('[aria-hidden="true"], svg').forEach((node) => node.remove());
      return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
    };
    window.__uatHitPoint = (element) => {
      const rect = element.getBoundingClientRect();
      for (const fy of [0.5, 0.35, 0.65, 0.2, 0.8, 0.05]) {
        for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
          const x = rect.left + rect.width * fx;
          const y = rect.top + rect.height * fy;
          const hit = document.elementFromPoint(x, y);
          if (hit !== null && (hit === element || element.contains(hit))) return { x, y };
        }
      }
      return null;
    };
  });
  const externalRequests = [];
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = request.url();
    const local = url.startsWith(base) || url.startsWith(base.replace("localhost", "127.0.0.1"));
    if (local || url.startsWith("data:") || url.startsWith("blob:")) {
      void request.continue();
    } else {
      externalRequests.push(url);
      void request.abort();
    }
  });
  // Everything that threw, for the whole suite: an uncaught page error and a
  // console error are both recorded with the step that was running, so a failing
  // `no_page_errors` names what arrived rather than only counting it.
  const pageErrors = [];
  let currentStep = "before the first step";
  page.on("pageerror", (error) => {
    pageErrors.push({
      kind: "pageerror",
      step: currentStep,
      message: error instanceof Error ? error.message : String(error),
    });
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // A failed subresource load (a missing favicon, an aborted media URL) is a
    // browser network diagnostic, not an uncaught error from the page. The
    // network step already fails any request the suite did not declare.
    if (/^Failed to load resource:/u.test(text)) return;
    pageErrors.push({
      kind: "console",
      step: currentStep,
      message: text,
      url: message.location()?.url ?? null,
    });
  });
  const state = { pageErrors };
  await page.setViewport(SCREENSHOT_VIEWPORTS[0]);
  const report = {
    suite: suite.suite ?? name,
    file: file.startsWith(REPO_ROOT) ? file.slice(REPO_ROOT.length) : file,
    theme,
    steps: [],
  };

  try {
    for (const step of steps) {
      currentStep = step.id ?? `step-${report.steps.length + 1}`;
      const stepTheme = step.theme ?? theme;
      const stream = step.stream ?? suite.stream;
      const url = harnessUrl(base, step, stream, stepTheme);
      let navError = null;
      try {
        await page.setViewport(stepViewport(step));
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await waitForHarness(page);
        await applyTheme(page, stepTheme);
        await sleep(100);
      } catch (cause) {
        navError = cause instanceof Error ? cause.message : String(cause);
      }
      const results = [];
      if (navError !== null) {
        const body = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");
        results.push({ name: "page mounts the harness", ok: false, detail: `${navError} ${body}` });
      } else {
        for (const action of step.actions ?? []) {
          // An inline assert checks the page between two actions, so a suite
          // can inspect a partial stream before the next push replaces it.
          if (action !== null && typeof action === "object" && action.assert !== undefined) {
            try {
              const result = await runAssertion(page, action.assert, state);
              results.push({ name: compact(action.assert), ...result });
            } catch (cause) {
              results.push({
                name: compact(action.assert),
                ok: false,
                detail: cause instanceof Error ? cause.message : String(cause),
              });
            }
            continue;
          }
          try {
            const detail = await runAction(page, action, state);
            // An action that can say what it did reports a passing row, so a
            // keyboard or fuzz step shows the focus path and the seed it ran.
            if (detail !== undefined) {
              results.push({ name: `action ${actionLabel(action)}`, ok: true, detail, show: true });
            }
          } catch (cause) {
            results.push({
              name: `action ${actionLabel(action)}`,
              ok: false,
              detail: cause instanceof Error ? cause.message : String(cause),
            });
          }
        }
        for (const assertion of step.assert ?? []) {
          try {
            const result = await runAssertion(page, assertion, state);
            results.push({ name: compact(assertion), ...result });
          } catch (cause) {
            results.push({
              name: compact(assertion),
              ok: false,
              detail: cause instanceof Error ? cause.message : String(cause),
            });
          }
        }
      }
      report.steps.push({
        id: step.id ?? `step-${report.steps.length + 1}`,
        title: step.title ?? step.id ?? `step ${report.steps.length + 1}`,
        ok: results.every((result) => result.ok),
        results,
      });
      const mark = report.steps.at(-1).ok ? "pass" : "FAIL";
      console.log(`  ${mark}  ${report.steps.at(-1).id}`);
      for (const result of results) {
        if (!result.ok) console.log(`        x ${result.name}: ${result.detail}`);
      }
    }

    // One artifact per suite at each required viewport, in the suite's own
    // theme. The final step's state is what the screenshots show.
    await mkdir(SHOT_DIR, { recursive: true });
    const shots = [];
    for (const viewport of SCREENSHOT_VIEWPORTS) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await applyTheme(page, theme);
      await sleep(200);
      const shotPath = `${SHOT_DIR}${name}.${viewport.width}x${viewport.height}.${theme}.png`;
      await page.screenshot({ path: shotPath });
      shots.push({
        ...viewport,
        theme,
        path: `shots/${name}.${viewport.width}x${viewport.height}.${theme}.png`,
      });
    }
    report.shots = shots;
    report.externalRequests = externalRequests;
    report.pageErrors = pageErrors;
    // A media suite names the URLs Chrome has to request; they are aborted
    // like every other external URL, and only a URL the suite did not name
    // fails the run.
    const undeclared = externalRequests.filter((url) => !declaredExternal.has(url));
    report.steps.push({
      id: "network",
      title: "The suite never reaches the network",
      ok: undeclared.length === 0,
      results: [
        {
          name: "no undeclared external requests",
          ok: undeclared.length === 0,
          detail:
            undeclared.length > 0
              ? compact(undeclared)
              : externalRequests.length === 0
                ? `${base} only`
                : `declared and aborted ${compact(externalRequests)}`,
        },
      ],
    });
  } finally {
    await page.close();
    await context.close();
    child.kill();
  }
  return report;
}

function renderReport(report, stamp) {
  const lines = ["# UAT report", "", `_Generated ${stamp} by \`npm run uat\`._`, ""];
  lines.push(`## ${report.suite}`, "", `Source: \`${report.file}\` | theme ${report.theme}`, "");
  lines.push("| Step | Result | Detail |", "| --- | --- | --- |");
  for (const step of report.steps) {
    const detail = step.results
      .map((result) => {
        const shown = result.ok !== true || result.show === true;
        return `${result.ok ? "ok" : "FAIL"} ${result.name}${shown ? ` (${result.detail})` : ""}`;
      })
      .join("; ");
    lines.push(`| ${step.title} | ${step.ok ? "pass" : "FAIL"} | ${detail} |`);
  }
  if (Array.isArray(report.pageErrors) && report.pageErrors.length > 0) {
    lines.push("", "### Page errors", "");
    for (const entry of report.pageErrors) {
      lines.push(`- \`${entry.kind}\` in ${entry.step}: ${entry.message}`);
    }
  }
  if (report.shots !== undefined) {
    lines.push("", "### Screenshots", "");
    for (const shot of report.shots) {
      lines.push(
        `![${report.suite} at ${shot.width}x${shot.height} in ${shot.theme}](${shot.path})`,
        "",
        `${shot.width}x${shot.height}, ${shot.theme} theme: \`docs/uat/${shot.path}\``,
        "",
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

await mkdir(REPORT_DIR, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars"],
});

const reports = [];
try {
  for (const file of suiteFiles) {
    console.log(`\n${file}`);
    reports.push(await runSuite(file, browser));
  }
} finally {
  await browser.close();
}

const stamp = new Date().toISOString();
const written = [];
for (const report of reports) {
  const outFile = `${REPORT_DIR}${report.suite}.md`;
  await writeFile(outFile, renderReport(report, stamp));
  written.push(outFile);
}

const failed = reports.flatMap((report) => report.steps).filter((step) => !step.ok).length;
console.log(`\n${failed === 0 ? "all steps passed" : `${failed} step(s) failed`}`);
console.log(`reports:\n${written.map((file) => `  ${file}`).join("\n")}`);
process.exit(failed === 0 ? 0 : 1);
