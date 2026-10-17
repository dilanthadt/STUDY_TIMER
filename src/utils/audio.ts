// Web Audio API synthesized chime for session completion
// Zero external file dependencies, completely reliable and self-contained
export function playCompletionChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic chord frequencies for gentle study celebration (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      // Smooth envelope attack and release
      gain.gain.setValueAtTime(0.001, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.85);
    });

    // Clean up audio context
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch (err) {
    console.warn('[Audio] Could not play completion chime:', err);
  }
}
