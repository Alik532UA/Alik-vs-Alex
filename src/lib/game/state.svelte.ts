import { MISSION_01 } from './configs';
import type { TowerId, HeroId } from './types';

export type ScreenMode = 'menu' | 'loadout' | 'briefing' | 'playing';

class GameController {
	screen = $state<ScreenMode>('menu');
	mission = $state(MISSION_01);

	// Loadout selection (max 5 towers, 2 heroes per concept doc)
	selectedTowers = $state<TowerId[]>([
		'robot_line',
		'drill',
		'mining_laser',
		'fastener',
		'pile_driver'
	]);
	selectedHeroes = $state<HeroId[]>(['fastener_hero', 'exosuit_hero']);

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
		if (this.selectedTowers.includes(id)) {
			if (this.selectedTowers.length > 1) {
				this.selectedTowers = this.selectedTowers.filter((t) => t !== id);
			}
		} else if (this.selectedTowers.length < 5) {
			this.selectedTowers = [...this.selectedTowers, id];
		}
	}

	toggleHeroInLoadout(id: HeroId) {
		if (this.selectedHeroes.includes(id)) {
			if (this.selectedHeroes.length > 1) {
				this.selectedHeroes = this.selectedHeroes.filter((h) => h !== id);
			}
		} else if (this.selectedHeroes.length < 2) {
			this.selectedHeroes = [...this.selectedHeroes, id];
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
