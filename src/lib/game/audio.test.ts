import { describe, expect, it } from 'vitest';
import { GameAudioManager } from './audio';

describe('Game Audio Engine (Architecture & Decoupling)', () => {
	it('initializes with bounded volume and unmuted status', () => {
		const audio = new GameAudioManager(0.7);
		expect(audio.getVolume()).toBeCloseTo(0.7);
		expect(audio.isMuted()).toBe(false);
	});

	it('clamps volume settings strictly between 0 and 1', () => {
		const audio = new GameAudioManager(0.5);
		audio.setVolume(-0.5);
		expect(audio.getVolume()).toBe(0);

		audio.setVolume(2.5);
		expect(audio.getVolume()).toBe(1);
	});

	it('toggles mute states correctly', () => {
		const audio = new GameAudioManager(0.5);
		expect(audio.toggleMute()).toBe(true);
		expect(audio.isMuted()).toBe(true);
		expect(audio.toggleMute()).toBe(false);
		expect(audio.isMuted()).toBe(false);
	});

	it('safely handles playSound calls in headless / node environment without throwing', () => {
		const audio = new GameAudioManager(0.5);
		expect(() => audio.playSound('laser_shot')).not.toThrow();
		expect(() => audio.playSound('explosion')).not.toThrow();
		expect(() => audio.playSound('tower_build')).not.toThrow();
		expect(() => audio.playSound('wave_alert')).not.toThrow();
		expect(() => audio.playSound('click')).not.toThrow();
	});
});

