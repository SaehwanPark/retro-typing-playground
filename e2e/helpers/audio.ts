import type { Page } from "@playwright/test";

/**
 * Installs a Web Audio stub before the app boots and returns a reader for how
 * many tones actually started. Both completion-sound E2E specs shared this
 * block; keeping it here means the audio contract is stubbed one way.
 */
export async function stubCompletionTone(page: Page): Promise<() => Promise<number>> {
  await page.addInitScript(() => {
    const target = window as typeof window & { __toneStarts?: number };
    target.__toneStarts = 0;
    class AudioContextMock {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime() {} },
          connect() {},
          start() { target.__toneStarts = (target.__toneStarts ?? 0) + 1; },
          stop() {},
          onended: null as (() => void) | null,
        };
      }
      createGain() {
        return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
      }
      close() { return Promise.resolve(); }
    }
    Object.defineProperty(window, "AudioContext", { configurable: true, value: AudioContextMock });
  });
  return () => page.evaluate(() => (window as typeof window & { __toneStarts?: number }).__toneStarts ?? 0);
}
