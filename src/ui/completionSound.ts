export function playCompletionTone(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => { void context.close(); };
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.15);
  } catch {
    // Audio is optional; a blocked or unsupported device must not interrupt practice.
  }
}
