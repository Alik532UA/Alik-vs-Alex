import { MISSION_01 } from './configs';
import type { TowerId, HeroId } from './types';
import { LOADOUT_PRESETS, ALL_TOWERS, ALL_HEROES, getRandomLoadout } from './presets';
import { storage } from '$lib/services/storage';

export type ScreenMode = 'menu' | 'loadout' | 'briefing' | 'playing';

class GameController {
	screen = $state<ScreenMode>('menu');
	mission = $state(MISSION_01);

	// Loadout selection (max 5 towers, max 2 heroes; min 1 tower, min 1 hero for challenge mode)
	selectedTowers = $state<TowerId[]>([
		'robot_line',
		'drill',
		'mining_laser',
		'fastener',
		'pile_driver'
	]);
	selectedHeroes = $state<HeroId[]>(['fastener_hero', 'exosuit_hero']);
	activePresetId = $state<string | null>('balance');

	// Real-time HUD reactive state
	lives = $state(20);
	currency = $state(280);
	currentWave = $state(0);
	totalWaves = $state(MISSION_01.waves.length);
	waveActive = $state(false);
	nextWaveCountdown = $state(0);

	// Simulation controls
	isPaused = $state(false); // Inspect-only pause: locks orders & building
	gameSpeed = $state<1 | 2>(1);
	outcome = $state<'none' | 'victory' | 'defeat'>('none');
	starsEarned = $state(0);

	// UI Selection states
	activeSlotId = $state<string | null>(null);
	activeHeroId = $state<HeroId | null>(null);
	editorMode = $state(false);

	toggleTowerInLoadout(id: TowerId) {
		this.activePresetId = null;
		if (this.selectedTowers.includes(id)) {
			this.selectedTowers = this.selectedTowers.filter((t) => t !== id);
		} else if (this.selectedTowers.length < 5) {
			this.selectedTowers = [...this.selectedTowers, id];
		} else {
			// At limit: replace oldest selection (FIFO) so deselecting is not required
			this.selectedTowers = [...this.selectedTowers.slice(1), id];
		}
		this.saveLoadout();
	}

	toggleHeroInLoadout(id: HeroId) {
		this.activePresetId = null;
		if (this.selectedHeroes.includes(id)) {
			this.selectedHeroes = this.selectedHeroes.filter((h) => h !== id);
		} else if (this.selectedHeroes.length < 2) {
			this.selectedHeroes = [...this.selectedHeroes, id];
		} else {
			// At limit: replace oldest selection (FIFO) so deselecting is not required
			this.selectedHeroes = [...this.selectedHeroes.slice(1), id];
		}
		this.saveLoadout();
	}

	applyPreset(presetKey: 'balance' | 'heavy' | 'control') {
		const preset = LOADOUT_PRESETS[presetKey];
		if (!preset) return;
		this.selectedTowers = [...preset.towers];
		this.selectedHeroes = [...preset.heroes];
		this.activePresetId = presetKey;
		this.saveLoadout();
	}

	randomizeLoadout() {
		const random = getRandomLoadout();
		this.selectedTowers = random.towers;
		this.selectedHeroes = random.heroes;
		this.activePresetId = null;
		this.saveLoadout();
	}

	clearLoadout() {
		this.selectedTowers = [];
		this.selectedHeroes = [];
		this.activePresetId = null;
		this.saveLoadout();
	}

	canStartMission(): boolean {
		return this.selectedTowers.length >= 1 && this.selectedHeroes.length >= 1;
	}

	private saveLoadout() {
		storage.setJSON('loadout', {
			towers: this.selectedTowers,
			heroes: this.selectedHeroes,
			preset: this.activePresetId
		});
	}

	loadSavedLoadout() {
		const saved = storage.getJSON<{
			towers?: TowerId[];
			heroes?: HeroId[];
			preset?: string | null;
		} | null>('loadout', null);

		if (saved && Array.isArray(saved.towers) && Array.isArray(saved.heroes)) {
			const validTowers = saved.towers.filter((t) => ALL_TOWERS.includes(t)).slice(0, 5);
			const validHeroes = saved.heroes.filter((h) => ALL_HEROES.includes(h)).slice(0, 2);
			if (validTowers.length > 0 || validHeroes.length > 0) {
				this.selectedTowers = validTowers;
				this.selectedHeroes = validHeroes;
				this.activePresetId = saved.preset ?? null;
			}
		}
	}

	startMission() {
		this.lives = this.mission.startingLives;
		this.currency = this.mission.startingCurrency;
		this.currentWave = 0;
		this.totalWaves = this.mission.waves.length;
		this.waveActive = false;
		this.nextWaveCountdown = 8;
		this.isPaused = false;
		this.gameSpeed = 1;
		this.outcome = 'none';
		this.activeSlotId = null;
		this.activeHeroId = null;
		this.screen = 'playing';
	}
}

export const game = new GameController();
