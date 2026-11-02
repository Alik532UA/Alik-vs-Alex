export type SoundEffect =
	'laser_shot' | 'explosion' | 'tower_build' | 'wave_alert' | 'defeat' | 'victory' | 'click';

export class GameAudioManager {
	private ctx: AudioContext | null = null;
	private volume: number = 0.5;
	private muted: boolean = false;

	constructor(initialVolume = 0.5) {
		this.volume = Math.max(0, Math.min(1, initialVolume));
	}

	public setVolume(vol: number): void {
		this.volume = Math.max(0, Math.min(1, vol));
	}

	public getVolume(): number {
		return this.volume;
	}

	public setMuted(muted: boolean): void {
		this.muted = muted;
	}

	public isMuted(): boolean {
		return this.muted;
	}

	public toggleMute(): boolean {
		this.muted = !this.muted;
		return this.muted;
	}

	private ensureContext(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!this.ctx) {
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (AudioContextClass) {
				this.ctx = new AudioContextClass();
			}
		}
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume().catch(() => {});
		}
		return this.ctx;
	}

	public playSound(effect: SoundEffect): void {
		if (this.muted || this.volume <= 0) return;
		const ctx = this.ensureContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		gain.gain.setValueAtTime(this.volume * 0.3, now);

		switch (effect) {
			case 'laser_shot':
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(880, now);
				osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.15);
				break;

			case 'explosion':
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(140, now);
				osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.3);
				break;

			case 'tower_build':
				osc.type = 'sine';
				osc.frequency.setValueAtTime(330, now);
				osc.frequency.setValueAtTime(660, now + 0.08);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.2);
				break;

			case 'wave_alert':
				osc.type = 'square';
				osc.frequency.setValueAtTime(440, now);
				osc.frequency.setValueAtTime(554, now + 0.1);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.25);
				break;

			case 'click':
			default:
				osc.type = 'sine';
				osc.frequency.setValueAtTime(800, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start(now);
				osc.stop(now + 0.05);
				break;
		}
	}
}

export const gameAudio = new GameAudioManager(0.5);
