/**
 * Operator-assisted E2E runner: drives YAML suites in tests/manual/a2ui/
 * against the real A2UI fence renderer mounted in the screenshot harness.
 *
 * Every interaction is a real DOM event: a slider is clicked and moved with
 * keyboard events, a button is clicked at its own box, and text is typed into
 * the focused field. No suite calls a component's internals.
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

async function waitForHarness(page) {
  await page.waitForSelector('[data-uat-ready="1"]', { timeout: 30_000 });
  await sleep(100);
}

function compact(value) {
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

async function runAction(page, action) {
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
  if (action.wait !== undefined) {
    await sleep(Number(action.wait));
    return;
  }
  throw new Error(`unknown action ${compact(action)}`);
}

async function runAssertion(page, assertion) {
  const [key] = Object.keys(assertion);
  const value = assertion[key];
  if (key === "text") {
    const body = await page.evaluate(() => document.querySelector("#root")?.innerText ?? "");
    return { ok: body.includes(value), detail: `text ${JSON.stringify(value)} in the page` };
  }
  if (key === "text_not") {
    const body = await page.evaluate(() => document.querySelector("#root")?.innerText ?? "");
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
  throw new Error(`unknown assertion ${compact(assertion)}`);
}

async function runSuite(file, browser) {
  const source = await readFile(file, "utf8");
  const suite = parse(source);
  const name = (file.split("/").pop() ?? "suite").replace(/\.yaml$/u, "");
  const theme = suite.defaults?.theme ?? "dark";
  const steps = Array.isArray(suite.steps) ? suite.steps : [];
  if (steps.length === 0) throw new Error(`${name}: suite has no steps`);

  const port = await freePort();
  const { child, base } = await startHarness(port);
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
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
  await page.setViewport(SCREENSHOT_VIEWPORTS[0]);
  const report = {
    suite: suite.suite ?? name,
    file: file.startsWith(REPO_ROOT) ? file.slice(REPO_ROOT.length) : file,
    theme,
    steps: [],
  };

  try {
    for (const step of steps) {
      const stepTheme = step.theme ?? theme;
      const stream = step.stream ?? suite.stream;
      const url = harnessUrl(base, step, stream, stepTheme);
      let navError = null;
      try {
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
          try {
            await runAction(page, action);
          } catch (cause) {
            results.push({
              name: `action ${compact(action)}`,
              ok: false,
              detail: cause instanceof Error ? cause.message : String(cause),
            });
          }
        }
        for (const assertion of step.assert ?? []) {
          try {
            const result = await runAssertion(page, assertion);
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
    if (externalRequests.length > 0) {
      report.steps.push({
        id: "network",
        title: "The suite never reaches the network",
        ok: false,
        results: [
          { name: "no external requests", ok: false, detail: compact(externalRequests) },
        ],
      });
    } else {
      report.steps.push({
        id: "network",
        title: "The suite never reaches the network",
        ok: true,
        results: [{ name: "no external requests", ok: true, detail: `${base} only` }],
      });
    }
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
      .map((result) => `${result.ok ? "ok" : "FAIL"} ${result.name}${result.ok ? "" : ` (${result.detail})`}`)
      .join("; ");
    lines.push(`| ${step.title} | ${step.ok ? "pass" : "FAIL"} | ${detail} |`);
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
