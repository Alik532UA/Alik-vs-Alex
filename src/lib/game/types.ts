export type TargetDomain = 'ground' | 'air' | 'both';

export type TowerId =
	| 'robot_line'
	| 'drill'
	| 'mining_laser'
	| 'crane'
	| 'fastener'
	| 'exosuit'
	| 'mine_layer'
	| 'pile_driver';

export type EnemyId =
	| 'pack_hound'
	| 'runner'
	| 'armored_beetle'
	| 'heavy_rhino'
	| 'jumper'
	| 'glider'
	| 'spore_carrier'
	| 'spitter'
	| 'shield_bearer'
	| 'broodmother';

export type HeroId = 'fastener_hero' | 'exosuit_hero' | 'laser_hero' | 'flamer_hero' | 'chemist_hero';

export interface Vec2 {
	x: number;
	y: number;
}

export interface TowerLevelStats {
	level: 1 | 2 | 3 | 4;
	cost: number;
	range: number;
	damage: number;
	cooldown: number; // seconds
	aoeRadius?: number;
	slowFactor?: number;
	slowDuration?: number;
	armorPierce?: number; // 0..1
	spawnInterval?: number;
	maxUnits?: number;
	unitHp?: number;
	unitDamage?: number;
	unitBattery?: number; // seconds
	deathShockDamage?: number;
	deathStunDuration?: number;
	description: string;
}

export interface TowerConfig {
	id: TowerId;
	name: string;
	role: string;
	targetDomain: TargetDomain;
	color: string;
	levels: [TowerLevelStats, TowerLevelStats, TowerLevelStats, TowerLevelStats];
}

export interface EnemyConfig {
	id: EnemyId;
	name: string;
	domain: 'ground' | 'air';
	hp: number;
	speed: number;
	armor: number; // 0.0 to 0.8 damage reduction
	damage: number; // melee DPS to units/heroes
	rangedDamage?: number;
	rangedRange?: number;
	reward: number;
	lifeCost: number;
	radius: number;
	color: string;
	canJump?: boolean;
	jumpCooldown?: number;
	spawnsOnDeath?: { id: EnemyId; count: number };
	periodicSpawn?: { id: EnemyId; interval: number };
	shieldAuraRadius?: number;
}

export interface HeroConfig {
	id: HeroId;
	name: string;
	profession: string;
	targetDomain: TargetDomain;
	hp: number;
	speed: number;
	damage: number;
	attackCooldown: number;
	range: number; // if <= 45, acts as melee blocker
	respawnTime: number;
	abilityName: string;
	abilityDesc: string;
	abilityCooldown: number;
	color: string;
}

export interface WaveGroup {
	enemyId: EnemyId;
	count: number;
	interval: number;
	delayAfter: number;
}

export interface WaveConfig {
	waveNumber: number;
	groups: WaveGroup[];
	earlyCallBonus: number;
}

export interface TowerSlot {
	id: string;
	x: number;
	y: number;
}

export interface DialogueLine {
	speaker: string;
	role: string;
	text: string;
	color: string;
}

export interface MissionConfig {
	id: string;
	number: number;
	district: string;
	title: string;
	subtitle: string;
	startingCurrency: number;
	startingLives: number;
	waypoints: Vec2[];
	towerSlots: TowerSlot[];
	waves: WaveConfig[];
	preMissionDialogue: DialogueLine[];
}
