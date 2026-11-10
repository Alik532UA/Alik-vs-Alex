import { MISSION_01 } from './configs';
import type { TowerId, HeroId } from './types';
import { LOADOUT_PRESETS, ALL_TOWERS, ALL_HEROES, getRandomLoadout } from './presets';
import { storage } from '$lib/services/storage';
import type { GameLocale } from '$lib/i18n/game';

export type ScreenMode = 'menu' | 'loadout' | 'briefing' | 'playing';

class GameController {
	screen = $state<ScreenMode>('menu');
	mission = $state(MISSION_01);
	locale = $state<GameLocale>('uk');

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

	setLocale(newLocale: GameLocale) {
		this.locale = newLocale;
		storage.set('settings_locale', newLocale);
	}

	loadSavedLocale() {
		const saved = storage.get('settings_locale');
		if (saved === 'uk' || saved === 'en') {
			this.locale = saved;
		} else {
			this.locale = 'uk';
			if (saved) {
				storage.set('settings_locale', 'uk');
			}
		}
	}

	toggleTowerInLoadout(id: TowerId) {
		this.activePresetId = null;
		if (this.selectedTowers.includes(id)) {
			// Deselects clicked tower, freeing slot for another selection
			this.selectedTowers = this.selectedTowers.filter((t) => t !== id);
		} else if (this.selectedTowers.length < 5) {
			// Selects tower only if under maximum limit
			this.selectedTowers = [...this.selectedTowers, id];
		}
		// Strict limit: if 5 are already selected, ignore unselected clicks until a tower is deselected
		this.saveLoadout();
	}

	toggleHeroInLoadout(id: HeroId) {
		this.activePresetId = null;
		if (this.selectedHeroes.includes(id)) {
			// Deselects clicked hero, freeing slot for another selection
			this.selectedHeroes = this.selectedHeroes.filter((h) => h !== id);
		} else if (this.selectedHeroes.length < 2) {
			// Selects hero only if under maximum limit
			this.selectedHeroes = [...this.selectedHeroes, id];
		}
		// Strict limit: if 2 are already selected, ignore unselected clicks until a hero is deselected
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
		this.loadSavedLocale();
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
