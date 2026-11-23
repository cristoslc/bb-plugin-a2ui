export interface HarnessHandle {
  child: { kill(): void };
  base: string;
}

export function freePort(): Promise<number>;

export function startHarness(port?: number): Promise<HarnessHandle>;
