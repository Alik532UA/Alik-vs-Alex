Нижче наведено повний, готовий до виконання промпт-специфікацію з усією важкою логікою гри (Data-Driven конфіги згідно з концепт-документом, реактивний стор на **Svelte 5 Runes**, математичне ігрове ядро на **HTML5 Canvas 60 FPS** з підтримкою всіх механік 4 рівнів веж, ігнорування броні, польоту, батарей роботів, перезарядки героїв та інтерактивний **Menu + HUD + Path Editor**).

Скопіюй блок нижче і передай його своєму AI-агенту (Claude Code / Roo Code / Cursor / Gemini CLI).

```markdown
# TASK FOR AI AGENT: Space Colony Tower Defense Prototype (Mission 1: The Workshop)

Create a complete, working SvelteKit (Svelte 5 Runes + TypeScript + TailwindCSS) project with `@sveltejs/adapter-static` configured for GitHub Pages.
Do NOT use heavy external canvas libraries—use the provided high-performance custom HTML5 2D Canvas Engine integrated with Svelte 5 state so it runs with zero external asset dependencies out of the box, while supporting optional sprite images in `/static/assets/`.

Write the following core files verbatim and wire up the standard SvelteKit boilerplate around them.

---

## 1. `src/lib/game/types.ts`

```typescript
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

```

---

## 2. `src/lib/game/configs.ts`

```typescript
import type { TowerConfig, EnemyConfig, HeroConfig, MissionConfig, TowerId, EnemyId, HeroId } from './types';

export const TOWERS: Record<TowerId, TowerConfig> = {
	robot_line: {
		id: 'robot_line',
		name: 'Складальна лінія роботів',
		role: 'Затримка та ослаблення потоку (земля)',
		targetDomain: 'ground',
		color: '#38bdf8',
		levels: [
			{
				level: 1, cost: 70, range: 115, damage: 0, cooldown: 0,
				spawnInterval: 4.5, maxUnits: 3, unitHp: 1, unitDamage: 0, unitBattery: 12,
				description: 'Прості болванчики. Лише затримують ворога. Гинуть з одного удару.'
			},
			{
				level: 2, cost: 90, range: 125, damage: 0, cooldown: 0,
				spawnInterval: 4.0, maxUnits: 3, unitHp: 65, unitDamage: 10, unitBattery: 15,
				description: 'Інструмент та броня. Роботи живуть довше і б’ють робочим інструментом.'
			},
			{
				level: 3, cost: 130, range: 130, damage: 0, cooldown: 0,
				spawnInterval: 3.6, maxUnits: 4, unitHp: 95, unitDamage: 16, unitBattery: 16,
				deathShockDamage: 55,
				description: 'Електричний модуль. При загибелі від ворога робот б’є струмом убивцю.'
			},
			{
				level: 4, cost: 180, range: 140, damage: 0, cooldown: 0,
				spawnInterval: 3.2, maxUnits: 4, unitHp: 130, unitDamage: 22, unitBattery: 18,
				deathShockDamage: 90, deathStunDuration: 1.4,
				description: 'Оглушуючий розряд. При загибелі завдає шкоди та оглушує ворога-вбивцю.'
			}
		]
	},
	drill: {
		id: 'drill',
		name: 'Бурова установка',
		role: 'Поштовхи та сповільнення в області (земля)',
		targetDomain: 'ground',
		color: '#facc15',
		levels: [
			{
				level: 1, cost: 80, range: 105, damage: 12, cooldown: 1.8,
				aoeRadius: 105, slowFactor: 0.3, slowDuration: 1.5,
				description: 'Компактний бур. Сповільнює та підтрушує наземних ворогів поруч.'
			},
			{
				level: 2, cost: 100, range: 125, damage: 20, cooldown: 1.7,
				aoeRadius: 125, slowFactor: 0.4, slowDuration: 1.8,
				description: 'Посилена основа. Більший радіус вібрації та сильніше сповільнення.'
			},
			{
				level: 3, cost: 140, range: 145, damage: 32, cooldown: 1.6,
				aoeRadius: 145, slowFactor: 0.5, slowDuration: 2.1,
				description: 'Посилений привід. Охоплює значну ділянку маршруту.'
			},
			{
				level: 4, cost: 200, range: 170, damage: 50, cooldown: 1.5,
				aoeRadius: 170, slowFactor: 0.65, slowDuration: 2.5,
				description: 'Повноцінна станція. Тотальний сейсмічний контроль широкої зони.'
			}
		]
	},
	mining_laser: {
		id: 'mining_laser',
		name: 'Гірничодобувний лазер',
		role: 'Найбільша постійна шкода зблизька (земля/повітря)',
		targetDomain: 'both',
		color: '#ef4444',
		levels: [
			{
				level: 1, cost: 100, range: 120, damage: 45, cooldown: 0.1,
				description: 'Кустарна переробка. Неперервний промінь по одній цілі на малій дистанції.'
			},
			{
				level: 2, cost: 120, range: 135, damage: 75, cooldown: 0.1,
				description: 'Стаціонарна версія. Посилена опора та потужніший випромінювач.'
			},
			{
				level: 3, cost: 160, range: 150, damage: 115, cooldown: 0.1,
				description: 'Два спеціалісти. Другий робітник обслуговує батареї живлення.'
			},
			{
				level: 4, cost: 220, range: 165, damage: 175, cooldown: 0.1,
				description: 'Місце оператора. Надпотужний плазмовий різак проти найміцніших цілей.'
			}
		]
	},
	crane: {
		id: 'crane',
		name: 'Будівельний кран',
		role: 'Рідкісні потужні удари по площі (земля)',
		targetDomain: 'ground',
		color: '#f97316',
		levels: [
			{
				level: 1, cost: 110, range: 210, damage: 55, cooldown: 3.2, aoeRadius: 65,
				description: 'Скидає важкі будівельні вантажі на скупчення наземних ворогів.'
			},
			{
				level: 2, cost: 130, range: 230, damage: 90, cooldown: 3.0, aoeRadius: 75,
				description: 'Подовжена стріла та важчі бетонні блоки.'
			},
			{
				level: 3, cost: 170, range: 250, damage: 140, cooldown: 2.8, aoeRadius: 85,
				description: 'Подвійний трос. Значний радіус ударної хвилі.'
			},
			{
				level: 4, cost: 230, range: 275, damage: 220, cooldown: 2.6, aoeRadius: 100,
				description: 'Важкий промисловий кран. Нищівна артилерійська підтримка.'
			}
		]
	},
	fastener: {
		id: 'fastener',
		name: 'Кріпильний метальник',
		role: 'Універсальний дальній обстріл (земля/повітря)',
		targetDomain: 'both',
		color: '#60a5fa',
		levels: [
			{
				level: 1, cost: 65, range: 175, damage: 18, cooldown: 0.75,
				description: 'Промисловий анкерний стрілець. Швидко б’є наземні та повітряні цілі.'
			},
			{
				level: 2, cost: 85, range: 195, damage: 30, cooldown: 0.68,
				description: 'Пневматичне подавання болтів. Вища швидкість і дальність.'
			},
			{
				level: 3, cost: 120, range: 215, damage: 46, cooldown: 0.6,
				description: 'Магнітний прискорювач кріплення.'
			},
			{
				level: 4, cost: 165, range: 240, damage: 70, cooldown: 0.5,
				description: 'Спарена автоматична турель важкого монтажу.'
			}
		]
	},
	exosuit: {
		id: 'exosuit',
		name: 'Платформа екзокостюмів',
		role: 'Стійкі бійці ближнього бою (земля)',
		targetDomain: 'ground',
		color: '#10b981',
		levels: [
			{
				level: 1, cost: 105, range: 120, damage: 0, cooldown: 0,
				spawnInterval: 7.0, maxUnits: 2, unitHp: 180, unitDamage: 18, unitBattery: 999,
				description: 'Двоє бійців у важких бурових екзокостюмах тримають позицію.'
			},
			{
				level: 2, cost: 130, range: 125, damage: 0, cooldown: 0,
				spawnInterval: 6.5, maxUnits: 2, unitHp: 260, unitDamage: 28, unitBattery: 999,
				description: 'Титанові пластини та гідравлічні кулаки.'
			},
			{
				level: 3, cost: 170, range: 130, damage: 0, cooldown: 0,
				spawnInterval: 6.0, maxUnits: 2, unitHp: 370, unitDamage: 42, unitBattery: 999,
				description: 'Посилені сервоприводи та вбудовані різаки.'
			},
			{
				level: 4, cost: 220, range: 140, damage: 0, cooldown: 0,
				spawnInterval: 5.5, maxUnits: 3, unitHp: 500, unitDamage: 60, unitBattery: 999,
				description: 'Три штурмові екзокостюми. Непорушна стіна оборони.'
			}
		]
	},
	mine_layer: {
		id: 'mine_layer',
		name: 'Укладальник мін',
		role: 'Заряди на маршруті, шкода по площі (земля)',
		targetDomain: 'ground',
		color: '#a855f7',
		levels: [
			{
				level: 1, cost: 85, range: 135, damage: 65, cooldown: 3.5, aoeRadius: 60, maxUnits: 3,
				description: 'Викладає до 3 промислових зарядів на дорогу. Короткий час зведення.'
			},
			{
				level: 2, cost: 110, range: 145, damage: 105, cooldown: 3.0, aoeRadius: 70, maxUnits: 4,
				description: 'До 4 зарядів одночасно, потужніша вибухівка.'
			},
			{
				level: 3, cost: 150, range: 155, damage: 160, cooldown: 2.6, aoeRadius: 80, maxUnits: 5,
				description: 'Швидке скидання нових мін одразу після підриву.'
			},
			{
				level: 4, cost: 200, range: 165, damage: 240, cooldown: 2.2, aoeRadius: 95, maxUnits: 6,
				description: 'Касетний мінний комплекс високої щільності.'
			}
		]
	},
	pile_driver: {
		id: 'pile_driver',
		name: 'Горизонтальний сваєбій',
		role: 'Потужний одиночний удар, пробиття броні (земля)',
		targetDomain: 'ground',
		color: '#ec4899',
		levels: [
			{
				level: 1, cost: 115, range: 230, damage: 95, cooldown: 3.4, armorPierce: 0.5,
				description: 'Важка гармата зі сваєбійного механізму. Ігнорує 50% броні цілі.'
			},
			{
				level: 2, cost: 140, range: 250, damage: 155, cooldown: 3.1, armorPierce: 0.65,
				description: 'Вольфрамовий стрижень. Ігнорує 65% броні.'
			},
			{
				level: 3, cost: 185, range: 270, damage: 245, cooldown: 2.8, armorPierce: 0.8,
				description: 'Пневмо-молот високого тиску. Ігнорує 80% броні.'
			},
			{
				level: 4, cost: 240, range: 300, damage: 380, cooldown: 2.5, armorPierce: 1.0,
				description: 'Надзвуковий сваєбій. Повністю прошиває будь-який панцир (100% пробиття).'
			}
		]
	}
};

export const ENEMIES: Record<EnemyId, EnemyConfig> = {
	pack_hound: {
		id: 'pack_hound', name: 'Стайник', domain: 'ground',
		hp: 85, speed: 62, armor: 0, damage: 12, reward: 12, lifeCost: 1, radius: 11, color: '#94a3b8'
	},
	runner: {
		id: 'runner', name: 'Бігун', domain: 'ground',
		hp: 55, speed: 108, armor: 0, damage: 8, reward: 14, lifeCost: 1, radius: 9, color: '#38bdf8'
	},
	armored_beetle: {
		id: 'armored_beetle', name: 'Панцирник', domain: 'ground',
		hp: 260, speed: 36, armor: 0.65, damage: 22, reward: 28, lifeCost: 2, radius: 15, color: '#8b5cf6'
	},
	heavy_rhino: {
		id: 'heavy_rhino', name: 'Важковаговик', domain: 'ground',
		hp: 580, speed: 28, armor: 0.35, damage: 45, reward: 45, lifeCost: 3, radius: 18, color: '#dc2626'
	},
	jumper: {
		id: 'jumper', name: 'Стрибун', domain: 'ground',
		hp: 140, speed: 78, armor: 0.1, damage: 18, reward: 22, lifeCost: 1, radius: 12, color: '#eab308',
		canJump: true, jumpCooldown: 4.5
	},
	glider: {
		id: 'glider', name: 'Планер', domain: 'air',
		hp: 130, speed: 68, armor: 0, damage: 0, reward: 20, lifeCost: 2, radius: 13, color: '#a855f7'
	},
	spore_carrier: {
		id: 'spore_carrier', name: 'Спороносець', domain: 'air',
		hp: 240, speed: 45, armor: 0.15, damage: 0, reward: 35, lifeCost: 2, radius: 16, color: '#c084fc',
		periodicSpawn: { id: 'pack_hound', interval: 5.5 }
	},
	spitter: {
		id: 'spitter', name: 'Плювальник', domain: 'ground',
		hp: 120, speed: 52, armor: 0, damage: 10, rangedDamage: 24, rangedRange: 130, reward: 24, lifeCost: 1, radius: 12, color: '#84cc16'
	},
	shield_bearer: {
		id: 'shield_bearer', name: 'Щитоносець', domain: 'ground',
		hp: 210, speed: 46, armor: 0.25, damage: 15, reward: 30, lifeCost: 2, radius: 14, color: '#06b6d4',
		shieldAuraRadius: 85
	},
	broodmother: {
		id: 'broodmother', name: 'Виводковик', domain: 'ground',
		hp: 340, speed: 38, armor: 0.2, damage: 25, reward: 36, lifeCost: 2, radius: 17, color: '#f43f5e',
		spawnsOnDeath: { id: 'runner', count: 3 }
	}
};

export const HEROES: Record<HeroId, HeroConfig> = {
	fastener_hero: {
		id: 'fastener_hero',
		name: 'Макс (Монтажник)',
		profession: 'Спеціаліст із важким метальником',
		targetDomain: 'both',
		hp: 320, speed: 125, damage: 26, attackCooldown: 0.55, range: 175, respawnTime: 12,
		abilityName: 'Турбо-привід',
		abilityDesc: 'Прискорює стрільбу втричі на 6 секунд',
		abilityCooldown: 18,
		color: '#f59e0b'
	},
	exosuit_hero: {
		id: 'exosuit_hero',
		name: 'Борг (Оператор Екзо)',
		profession: 'Штурмовий буровий екзокостюм',
		targetDomain: 'ground',
		hp: 650, speed: 95, damage: 38, attackCooldown: 0.9, range: 40, respawnTime: 15,
		abilityName: 'Титановий щит',
		abilityDesc: 'Відновлює 250 HP та оглушує ворогів навколо',
		abilityCooldown: 20,
		color: '#10b981'
	},
	laser_hero: {
		id: 'laser_hero',
		name: 'Ірина (Лазерниця)',
		profession: 'Портативний гірничий різак',
		targetDomain: 'both',
		hp: 280, speed: 115, damage: 55, attackCooldown: 0.35, range: 145, respawnTime: 12,
		abilityName: 'Перевантаження променя',
		abilityDesc: 'Миттєвий імпульс на 280 шкоди по найсильнішій цілі поруч',
		abilityCooldown: 16,
		color: '#ef4444'
	},
	flamer_hero: {
		id: 'flamer_hero',
		name: 'Влад (Вогнеметник)',
		profession: 'Термічна зачистка породи',
		targetDomain: 'ground',
		hp: 420, speed: 105, damage: 22, attackCooldown: 0.4, range: 95, respawnTime: 14,
		abilityName: 'Вогняне кільце',
		abilityDesc: 'Підпалює землю навколо себе, спалюючи групу ворогів',
		abilityCooldown: 18,
		color: '#f97316'
	},
	chemist_hero: {
		id: 'chemist_hero',
		name: 'Док (Хімік-підривник)',
		profession: 'Промислові реагенти та вибухівка',
		targetDomain: 'ground',
		hp: 300, speed: 115, damage: 30, attackCooldown: 0.8, range: 160, respawnTime: 12,
		abilityName: 'Кислотна хмара',
		abilityDesc: 'Отруює та руйнує броню всім ворогам у радіусі',
		abilityCooldown: 17,
		color: '#a855f7'
	}
};

export const MISSION_01: MissionConfig = {
	id: 'mission_01',
	number: 1,
	district: 'Район 1: Промислова околиця',
	title: 'Місія 01: Майстерня',
	subtitle: 'Утримайте головний цех і перетворіть мирне обладнання на зброю оборони',
	startingCurrency: 280,
	startingLives: 20,
	waypoints: [
		{ x: 40, y: 140 },
		{ x: 260, y: 140 },
		{ x: 260, y: 380 },
		{ x: 540, y: 380 },
		{ x: 540, y: 180 },
		{ x: 800, y: 180 },
		{ x: 800, y: 460 },
		{ x: 1060, y: 460 }
	],
	towerSlots: [
		{ id: 's1', x: 175, y: 220 },
		{ id: 's2', x: 345, y: 210 },
		{ id: 's3', x: 350, y: 305 },
		{ id: 's4', x: 445, y: 460 },
		{ id: 's5', x: 460, y: 270 },
		{ id: 's6', x: 630, y: 270 },
		{ id: 's7', x: 715, y: 105 },
		{ id: 's8', x: 715, y: 340 },
		{ id: 's9', x: 890, y: 365 }
	],
	preMissionDialogue: [
		{
			speaker: 'Макс (Монтажник)',
			role: 'Інженер кріплення',
			text: 'Вибух на шахті вивів із ладу периметр! Хвиля тварюк пре просто на нашу майстерню!',
			color: '#f59e0b'
		},
		{
			speaker: 'Борг (Оператор Екзо)',
			role: 'Буровий спеціаліст',
			text: 'Армії тут немає. Переналаштовуйте бури, гірничі лазери та конвеєри роботів. Ми дамо їм бій тим, що під рукою!',
			color: '#10b981'
		}
	],
	waves: [
		{
			waveNumber: 1,
			earlyCallBonus: 25,
			groups: [{ enemyId: 'pack_hound', count: 6, interval: 1.4, delayAfter: 2 }]
		},
		{
			waveNumber: 2,
			earlyCallBonus: 30,
			groups: [
				{ enemyId: 'pack_hound', count: 5, interval: 1.2, delayAfter: 2 },
				{ enemyId: 'runner', count: 4, interval: 0.9, delayAfter: 2 }
			]
		},
		{
			waveNumber: 3,
			earlyCallBonus: 35,
			groups: [
				{ enemyId: 'armored_beetle', count: 2, interval: 3.0, delayAfter: 1 },
				{ enemyId: 'pack_hound', count: 6, interval: 1.1, delayAfter: 2 }
			]
		},
		{
			waveNumber: 4,
			earlyCallBonus: 40,
			groups: [
				{ enemyId: 'glider', count: 5, interval: 1.6, delayAfter: 2 },
				{ enemyId: 'runner', count: 6, interval: 0.8, delayAfter: 2 }
			]
		},
		{
			waveNumber: 5,
			earlyCallBonus: 50,
			groups: [
				{ enemyId: 'armored_beetle', count: 3, interval: 2.5, delayAfter: 1 },
				{ enemyId: 'spitter', count: 4, interval: 1.8, delayAfter: 2 },
				{ enemyId: 'glider', count: 4, interval: 1.5, delayAfter: 2 }
			]
		},
		{
			waveNumber: 6,
			earlyCallBonus: 60,
			groups: [
				{ enemyId: 'heavy_rhino', count: 2, interval: 4.0, delayAfter: 2 },
				{ enemyId: 'shield_bearer', count: 2, interval: 3.0, delayAfter: 1 },
				{ enemyId: 'broodmother', count: 3, interval: 3.2, delayAfter: 1 },
				{ enemyId: 'spore_carrier', count: 2, interval: 4.0, delayAfter: 2 }
			]
		}
	]
};

```

---

## 3. `src/lib/game/state.svelte.ts`

```typescript
import { MISSION_01, TOWERS, HEROES, ENEMIES } from './configs';
import type { TowerId, HeroId, Vec2, TowerSlot } from './types';

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
	activeHeroId = $state<HeroId null |>(null);
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

```

---

## 4. `src/lib/game/engine.ts`

```typescript
import { ENEMIES, HEROES, TOWERS } from './configs';
import { game } from './state.svelte';
import type { EnemyId, HeroId, TowerId, Vec2 } from './types';

export interface ActiveEnemy {
	uid: number;
	type: EnemyId;
	x: number;
	y: number;
	hp: number;
	maxHp: number;
	waypointIndex: number;
	distanceTraveled: number;
	slowTimer: number;
	slowFactor: number;
	stunTimer: number;
	lastStunTime: number;
	armorShredTimer: number;
	shieldedTimer: number;
	blockedByUnitUid: number | null;
	jumpTimer: number;
	spawnTimer: number;
	attackTimer: number;
}

export interface ActiveTower {
	slotId: string;
	type: TowerId;
	level: 1 | 2 | 3 | 4;
	x: number;
	y: number;
	cooldownTimer: number;
	spawnTimer: number;
	laserTargetUid: number | null;
}

export interface AlliedUnit {
	uid: number;
	parentSlotId: string;
	towerType: TowerId;
	towerLevel: 1 | 2 | 3 | 4;
	x: number;
	y: number;
	homeX: number;
	homeY: number;
	hp: number;
	maxHp: number;
	damage: number;
	batteryTimer: number;
	maxBattery: number;
	deathShockDamage: number;
	deathStunDuration: number;
	attackTimer: number;
}

export interface ActiveMine {
	uid: number;
	parentSlotId: string;
	x: number;
	y: number;
	damage: number;
	aoeRadius: number;
	armingTimer: number; // Prevents instant chain reaction per doc
}

export interface ActiveHero {
	id: HeroId;
	x: number;
	y: number;
	targetX: number;
	targetY: number;
	hp: number;
	maxHp: number;
	respawnTimer: number;
	attackTimer: number;
	abilityCooldownTimer: number;
	buffTimer: number;
}

export interface VisualEffect {
	x: number;
	y: number;
	targetX?: number;
	targetY?: number;
	radius?: number;
	color: string;
	ttl: number;
	maxTtl: number;
	kind: 'circle' | 'beam' | 'text';
	text?: string;
}

export class TDGameEngine {
	enemies: ActiveEnemy[] = [];
	towers: Map<string, ActiveTower> = new Map();
	units: AlliedUnit[] = [];
	mines: ActiveMine[] = [];
	heroes: ActiveHero[] = [];
	effects: VisualEffect[] = [];

	private uidCounter = 1;
	private spawnQueue: { enemyId: EnemyId; spawnAt: number }[] = [];
	private waveElapsed = 0;
	private simTime = 0;

	constructor() {
		this.reset();
	}

	reset() {
		this.enemies = [];
		this.towers.clear();
		this.units = [];
		this.mines = [];
		this.effects = [];
		this.spawnQueue = [];
		this.waveElapsed = 0;
		this.simTime = 0;

		// Spawn 2 selected heroes near the middle of the map
		this.heroes = game.selectedHeroes.map((id, idx) => {
			const cfg = HEROES[id];
			const startPos = game.mission.waypoints[Math.min(2 + idx, game.mission.waypoints.length - 1)];
			return {
				id,
				x: startPos.x,
				y: startPos.y + (idx === 0 ? -20 : 20),
				targetX: startPos.x,
				targetY: startPos.y + (idx === 0 ? -20 : 20),
				hp: cfg.hp,
				maxHp: cfg.hp,
				respawnTimer: 0,
				attackTimer: 0,
				abilityCooldownTimer: 0,
				buffTimer: 0
			};
		});
	}

	// Build or upgrade tower (blocked during pause per concept doc)
	buildTower(slotId: string, type: TowerId) {
		if (game.isPaused || game.outcome !== 'none') return;
		const slot = game.mission.towerSlots.find((s) => s.id === slotId);
		if (!slot || this.towers.has(slotId)) return;
		const cost = TOWERS[type].levels[0].cost;
		if (game.currency < cost) return;

		game.currency -= cost;
		this.towers.set(slotId, {
			slotId,
			type,
			level: 1,
			x: slot.x,
			y: slot.y,
			cooldownTimer: 0,
			spawnTimer: 0.5,
			laserTargetUid: null
		});
		game.activeSlotId = null;
	}

	upgradeTower(slotId: string) {
		if (game.isPaused || game.outcome !== 'none') return;
		const tower = this.towers.get(slotId);
		if (!tower || tower.level >= 4) return;
		const nextStats = TOWERS[tower.type].levels[tower.level];
		if (game.currency < nextStats.cost) return;

		game.currency -= nextStats.cost;
		tower.level = (tower.level + 1) as 1 | 2 | 3 | 4;
		this.effects.push({
			x: tower.x,
			y: tower.y - 25,
			color: '#facc15',
			ttl: 0.8,
			maxTtl: 0.8,
			kind: 'text',
			text: `LVL ${tower.level}!`
		});
	}

	sellTower(slotId: string) {
		if (game.isPaused || game.outcome !== 'none') return;
		const tower = this.towers.get(slotId);
		if (!tower) return;
		const cfg = TOWERS[tower.type];
		let invested = 0;
		for (let i = 0; i < tower.level; i++) invested += cfg.levels[i].cost;
		game.currency += Math.floor(invested * 0.7);
		this.towers.delete(slotId);
		this.units = this.units.filter((u) => u.parentSlotId !== slotId);
		this.mines = this.mines.filter((m) => m.parentSlotId !== slotId);
		game.activeSlotId = null;
	}

	callNextWave(early = false) {
		if (game.isPaused || game.outcome !== 'none') return;
		if (game.currentWave >= game.mission.waves.length) return;

		const waveCfg = game.mission.waves[game.currentWave];
		if (early && (game.waveActive || game.nextWaveCountdown > 0)) {
			game.currency += waveCfg.earlyCallBonus;
			this.effects.push({
				x: game.mission.waypoints[0].x + 40,
				y: game.mission.waypoints[0].y - 20,
				color: '#4ade80',
				ttl: 1.2,
				maxTtl: 1.2,
				kind: 'text',
				text: `+${waveCfg.earlyCallBonus}⚡ Достроково!`
			});
		}

		game.currentWave += 1;
		game.waveActive = true;
		game.nextWaveCountdown = 0;

		let cursorTime = this.waveElapsed;
		for (const group of waveCfg.groups) {
			for (let i = 0; i < group.count; i++) {
				this.spawnQueue.push({ enemyId: group.enemyId, spawnAt: cursorTime });
				cursorTime += group.interval;
			}
			cursorTime += group.delayAfter;
		}
	}

	moveHero(heroId: HeroId, target: Vec2) {
		if (game.isPaused || game.outcome !== 'none') return;
		const hero = this.heroes.find((h) => h.id === heroId);
		if (!hero || hero.respawnTimer > 0) return;
		hero.targetX = target.x;
		hero.targetY = target.y;
		this.effects.push({
			x: target.x,
			y: target.y,
			radius: 16,
			color: HEROES[heroId].color,
			ttl: 0.35,
			maxTtl: 0.35,
			kind: 'circle'
		});
	}

	triggerHeroAbility(heroId: HeroId) {
		if (game.isPaused || game.outcome !== 'none') return;
		const hero = this.heroes.find((h) => h.id === heroId);
		if (!hero || hero.respawnTimer > 0 || hero.abilityCooldownTimer > 0) return;
		const cfg = HEROES[heroId];
		hero.abilityCooldownTimer = cfg.abilityCooldown;

		if (heroId === 'fastener_hero') {
			hero.buffTimer = 6.0;
		} else if (heroId === 'exosuit_hero') {
			hero.hp = Math.min(hero.maxHp, hero.hp + 250);
			this.enemies.forEach((e) => {
				if (ENEMIES[e.type].domain === 'ground' && Math.hypot(e.x - hero.x, e.y - hero.y) <= 110) {
					e.stunTimer = 2.2;
					this.dealDamage(e, 65, 0.5);
				}
			});
		} else if (heroId === 'laser_hero') {
			const target = this.enemies
				.filter((e) => Math.hypot(e.x - hero.x, e.y - hero.y) <= 200)
				.sort((a, b) => b.hp - a.hp)[0];
			if (target) {
				this.dealDamage(target, 280, 0.8);
				this.effects.push({
					x: hero.x, y: hero.y, targetX: target.x, targetY: target.y,
					color: '#ef4444', ttl: 0.4, maxTtl: 0.4, kind: 'beam'
				});
			}
		} else if (heroId === 'flamer_hero') {
			this.enemies.forEach((e) => {
				if (ENEMIES[e.type].domain === 'ground' && Math.hypot(e.x - hero.x, e.y - hero.y) <= 125) {
					this.dealDamage(e, 140, 0.3);
				}
			});
		} else if (heroId === 'chemist_hero') {
			this.enemies.forEach((e) => {
				if (Math.hypot(e.x - hero.x, e.y - hero.y) <= 150) {
					e.armorShredTimer = 8.0;
					this.dealDamage(e, 85, 1.0);
				}
			});
		}

		this.effects.push({
			x: hero.x,
			y: hero.y,
			radius: 115,
			color: cfg.color,
			ttl: 0.5,
			maxTtl: 0.5,
			kind: 'circle'
		});
	}

	private spawnEnemy(type: EnemyId, pos?: Vec2, waypointIndex = 0, distanceTraveled = 0) {
		const cfg = ENEMIES[type];
		const start = pos ?? game.mission.waypoints[0];
		this.enemies.push({
			uid: this.uidCounter++,
			type,
			x: start.x,
			y: start.y,
			hp: cfg.hp,
			maxHp: cfg.hp,
			waypointIndex,
			distanceTraveled,
			slowTimer: 0,
			slowFactor: 0,
			stunTimer: 0,
			lastStunTime: -99,
			armorShredTimer: 0,
			shieldedTimer: 0,
			blockedByUnitUid: null,
			jumpTimer: cfg.jumpCooldown ?? 4,
			spawnTimer: cfg.periodicSpawn?.interval ?? 5,
			attackTimer: 0
		});
	}

	private dealDamage(enemy: ActiveEnemy, rawDamage: number, armorPierce = 0): boolean {
		const cfg = ENEMIES[enemy.type];
		const effectiveArmor = enemy.armorShredTimer > 0 ? 0 : cfg.armor * (1 - armorPierce);
		const shieldMultiplier = enemy.shieldedTimer > 0 ? 0.55 : 1.0;
		const finalDamage = Math.max(1, rawDamage * (1 - effectiveArmor) * shieldMultiplier);
		enemy.hp -= finalDamage;

		if (enemy.hp <= 0) {
			game.currency += cfg.reward;
			if (cfg.spawnsOnDeath) {
				for (let i = 0; i < cfg.spawnsOnDeath.count; i++) {
					this.spawnEnemy(
						cfg.spawnsOnDeath.id,
						{ x: enemy.x + (i - 1) * 12, y: enemy.y + (i - 1) * 12 },
						enemy.waypointIndex,
						enemy.distanceTraveled
					);
				}
			}
			this.enemies = this.enemies.filter((e) => e.uid !== enemy.uid);
			return true;
		}
		return false;
	}

	private findNearestPointOnRoad(x: number, y: number, maxRange: number): Vec2 {
		const wps = game.mission.waypoints;
		let best: Vec2 = { x, y };
		let bestDist = Infinity;
		for (let i = 0; i < wps.length - 1; i++) {
			const a = wps[i];
			const b = wps[i + 1];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const lenSq = dx * dx + dy * dy;
			const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lenSq));
			const px = a.x + t * dx;
			const py = a.y + t * dy;
			const d = Math.hypot(px - x, py - y);
			if (d < bestDist && d <= maxRange) {
				bestDist = d;
				best = { x: px, y: py };
			}
		}
		return best;
	}

	update(rawDt: number) {
		if (game.isPaused || game.outcome !== 'none') return;
		const dt = Math.min(rawDt, 0.1) * game.gameSpeed;
		this.simTime += dt;

		// Countdown before next wave
		if (!game.waveActive && game.currentWave < game.mission.waves.length) {
			game.nextWaveCountdown = Math.max(0, game.nextWaveCountdown - dt);
			if (game.nextWaveCountdown === 0) {
				this.callNextWave(false);
			}
		}

		// Process wave spawn queue
		if (game.waveActive) {
			this.waveElapsed += dt;
			while (this.spawnQueue.length > 0 && this.spawnQueue[0].spawnAt <= this.waveElapsed) {
				const item = this.spawnQueue.shift()!;
				this.spawnEnemy(item.enemyId);
			}
			if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
				game.waveActive = false;
				if (game.currentWave >= game.mission.waves.length) {
					game.outcome = 'victory';
					const maxLives = game.mission.startingLives;
					game.starsEarned = game.lives === maxLives ? 3 : game.lives >= maxLives * 0.5 ? 2 : 1;
				} else {
					game.nextWaveCountdown = 10;
				}
			}
		}

		// Shield bearer aura pass
		for (const e of this.enemies) {
			const cfg = ENEMIES[e.type];
			if (cfg.shieldAuraRadius) {
				for (const other of this.enemies) {
					if (other.uid !== e.uid && Math.hypot(other.x - e.x, other.y - e.y) <= cfg.shieldAuraRadius) {
						other.shieldedTimer = 0.3;
					}
				}
			}
		}

		// Update enemies
		const wps = game.mission.waypoints;
		for (const e of [...this.enemies]) {
			const cfg = ENEMIES[e.type];
			e.slowTimer = Math.max(0, e.slowTimer - dt);
			e.stunTimer = Math.max(0, e.stunTimer - dt);
			e.armorShredTimer = Math.max(0, e.armorShredTimer - dt);
			e.shieldedTimer = Math.max(0, e.shieldedTimer - dt);

			if (e.stunTimer > 0) continue;

			// Periodic spawn (Spore Carrier)
			if (cfg.periodicSpawn) {
				e.spawnTimer -= dt;
				if (e.spawnTimer <= 0) {
					e.spawnTimer = cfg.periodicSpawn.interval;
					this.spawnEnemy(cfg.periodicSpawn.id, { x: e.x, y: e.y }, e.waypointIndex, e.distanceTraveled);
				}
			}

			// Check if blocked by an allied unit
			if (e.blockedByUnitUid !== null) {
				const blocker = this.units.find((u) => u.uid === e.blockedByUnitUid);
				if (!blocker) {
					e.blockedByUnitUid = null;
				} else if (cfg.canJump && e.jumpTimer <= 0) {
					// Jumper leaps over blocker
					e.jumpTimer = cfg.jumpCooldown ?? 4.5;
					e.blockedByUnitUid = null;
					this.effects.push({
						x: e.x, y: e.y - 12, color: '#eab308', ttl: 0.5, maxTtl: 0.5, kind: 'text', text: 'СТРИБОК!'
					});
				} else {
					e.attackTimer -= dt;
					if (e.attackTimer <= 0) {
						e.attackTimer = 1.0;
						blocker.hp -= cfg.damage;
						if (blocker.hp <= 0) {
							this.handleUnitKilledByEnemy(blocker, e);
						}
					}
					continue;
				}
			}
			e.jumpTimer = Math.max(0, e.jumpTimer - dt);

			// Ranged Spitter attacks nearby allied units
			if (cfg.rangedDamage && cfg.rangedRange) {
				e.attackTimer -= dt;
				const unitTarget = this.units.find((u) => Math.hypot(u.x - e.x, u.y - e.y) <= cfg.rangedRange!);
				if (unitTarget && e.attackTimer <= 0) {
					e.attackTimer = 1.4;
					unitTarget.hp -= cfg.rangedDamage;
					this.effects.push({
						x: e.x, y: e.y, targetX: unitTarget.x, targetY: unitTarget.y,
						color: '#84cc16', ttl: 0.15, maxTtl: 0.15, kind: 'beam'
					});
					if (unitTarget.hp <= 0) this.handleUnitKilledByEnemy(unitTarget, e);
				}
			}

			// Move along waypoints
			const nextWp = wps[e.waypointIndex + 1];
			if (!nextWp) {
				// Breached exit
				game.lives = Math.max(0, game.lives - cfg.lifeCost);
				this.enemies = this.enemies.filter((en) => en.uid !== e.uid);
				if (game.lives <= 0) {
					game.outcome = 'defeat';
				}
				continue;
			}

			const speedMult = e.slowTimer > 0 ? 1 - e.slowFactor : 1;
			const step = cfg.speed * speedMult * dt;
			const dx = nextWp.x - e.x;
			const dy = nextWp.y - e.y;
			const dist = Math.hypot(dx, dy);

			if (dist <= step) {
				e.x = nextWp.x;
				e.y = nextWp.y;
				e.waypointIndex += 1;
			} else {
				e.x += (dx / dist) * step;
				e.y += (dy / dist) * step;
			}
			e.distanceTraveled += step;
		}

		// Update towers
		for (const tower of this.towers.values()) {
			const cfg = TOWERS[tower.type];
			const stats = cfg.levels[tower.level - 1];

			// Robot Assembly Line & Exosuit Platform unit production
			if (tower.type === 'robot_line' || tower.type === 'exosuit') {
				// Per concept doc: Robot line produces ONLY during an active wave
				if (tower.type === 'robot_line' && !game.waveActive) continue;

				const activeCount = this.units.filter((u) => u.parentSlotId === tower.slotId).length;
				if (activeCount < (stats.maxUnits ?? 3)) {
					tower.spawnTimer -= dt;
					if (tower.spawnTimer <= 0) {
						tower.spawnTimer = stats.spawnInterval ?? 4;
						const roadPt = this.findNearestPointOnRoad(tower.x, tower.y, stats.range);
						const offsetAngle = (activeCount * Math.PI * 2) / 3;
						this.units.push({
							uid: this.uidCounter++,
							parentSlotId: tower.slotId,
							towerType: tower.type,
							towerLevel: tower.level,
							x: roadPt.x + Math.cos(offsetAngle) * 14,
							y: roadPt.y + Math.sin(offsetAngle) * 14,
							homeX: roadPt.x + Math.cos(offsetAngle) * 14,
							homeY: roadPt.y + Math.sin(offsetAngle) * 14,
							hp: stats.unitHp ?? 50,
							maxHp: stats.unitHp ?? 50,
							damage: stats.unitDamage ?? 10,
							batteryTimer: stats.unitBattery ?? 12,
							maxBattery: stats.unitBattery ?? 12,
							deathShockDamage: stats.deathShockDamage ?? 0,
							deathStunDuration: stats.deathStunDuration ?? 0,
							attackTimer: 0
						});
					}
				}
				continue;
			}

			// Mine Layer
			if (tower.type === 'mine_layer') {
				const myMines = this.mines.filter((m) => m.parentSlotId === tower.slotId);
				if (myMines.length < (stats.maxUnits ?? 3)) {
					tower.cooldownTimer -= dt;
					if (tower.cooldownTimer <= 0) {
						tower.cooldownTimer = stats.cooldown;
						const roadPt = this.findNearestPointOnRoad(tower.x, tower.y, stats.range);
						this.mines.push({
							uid: this.uidCounter++,
							parentSlotId: tower.slotId,
							x: roadPt.x + (Math.random() - 0.5) * 36,
							y: roadPt.y + (Math.random() - 0.5) * 36,
							damage: stats.damage,
							aoeRadius: stats.aoeRadius ?? 65,
							armingTimer: 0.9 // Short arming time per doc
						});
					}
				}
				continue;
			}

			// Direct attack towers
			tower.cooldownTimer = Math.max(0, tower.cooldownTimer - dt);
			const validTargets = this.enemies
				.filter((e) => {
					const eDomain = ENEMIES[e.type].domain;
					const domainMatch = cfg.targetDomain === 'both' || cfg.targetDomain === eDomain;
					return domainMatch && Math.hypot(e.x - tower.x, e.y - tower.y) <= stats.range;
				})
				.sort((a, b) => b.distanceTraveled - a.distanceTraveled);

			if (validTargets.length === 0) {
				tower.laserTargetUid = null;
				continue;
			}

			if (tower.type === 'mining_laser') {
				const target = validTargets[0];
				tower.laserTargetUid = target.uid;
				this.dealDamage(target, stats.damage * dt, 0.2);
			} else if (tower.cooldownTimer <= 0) {
				tower.cooldownTimer = stats.cooldown;
				if (tower.type === 'drill') {
					for (const t of validTargets) {
						t.slowFactor = Math.max(t.slowFactor, stats.slowFactor ?? 0.35);
						t.slowTimer = stats.slowDuration ?? 1.6;
						this.dealDamage(t, stats.damage, 0);
					}
					this.effects.push({
						x: tower.x, y: tower.y, radius: stats.range,
						color: cfg.color, ttl: 0.3, maxTtl: 0.3, kind: 'circle'
					});
				} else if (tower.type === 'crane') {
					const primary = validTargets[0];
					for (const e of [...this.enemies]) {
						if (
							ENEMIES[e.type].domain === 'ground' &&
							Math.hypot(e.x - primary.x, e.y - primary.y) <= (stats.aoeRadius ?? 70)
						) {
							this.dealDamage(e, stats.damage, 0.15);
						}
					}
					this.effects.push({
						x: primary.x, y: primary.y, radius: stats.aoeRadius ?? 70,
						color: cfg.color, ttl: 0.35, maxTtl: 0.35, kind: 'circle'
					});
				} else {
					// Fastener or Horizontal Pile Driver
					const primary =
						tower.type === 'pile_driver'
							? [...validTargets].sort((a, b) => ENEMIES[b.type].armor - ENEMIES[a.type].armor)[0]
							: validTargets[0];
					this.dealDamage(primary, stats.damage, stats.armorPierce ?? 0);
					this.effects.push({
						x: tower.x, y: tower.y, targetX: primary.x, targetY: primary.y,
						color: cfg.color, ttl: 0.14, maxTtl: 0.14, kind: 'beam'
					});
				}
			}
		}

		// Update allied units (Robots & Exosuits)
		for (const u of [...this.units]) {
			// Robot battery countdown: expiring battery does NOT trigger shock per doc
			if (u.towerType === 'robot_line') {
				u.batteryTimer -= dt;
				if (u.batteryTimer <= 0) {
					this.units = this.units.filter((item) => item.uid !== u.uid);
					continue;
				}
			}

			// Grab nearest unblocked ground enemy
			const enemy = this.enemies.find(
				(e) =>
					ENEMIES[e.type].domain === 'ground' &&
					(e.blockedByUnitUid === u.uid || e.blockedByUnitUid === null) &&
					Math.hypot(e.x - u.x, e.y - u.y) <= 32
			);

			if (enemy) {
				enemy.blockedByUnitUid = u.uid;
				u.attackTimer -= dt;
				if (u.attackTimer <= 0 && u.damage > 0) {
					u.attackTimer = 0.9;
					this.dealDamage(enemy, u.damage, 0);
				}
			}
		}

		// Update mines
		for (const m of [...this.mines]) {
			if (m.armingTimer > 0) {
				m.armingTimer -= dt;
				continue;
			}
			const trigger = this.enemies.find(
				(e) => ENEMIES[e.type].domain === 'ground' && Math.hypot(e.x - m.x, e.y - m.y) <= 22
			);
			if (trigger) {
				for (const e of [...this.enemies]) {
					if (ENEMIES[e.type].domain === 'ground' && Math.hypot(e.x - m.x, e.y - m.y) <= m.aoeRadius) {
						this.dealDamage(e, m.damage, 0.3);
					}
				}
				this.effects.push({
					x: m.x, y: m.y, radius: m.aoeRadius,
					color: '#a855f7', ttl: 0.35, maxTtl: 0.35, kind: 'circle'
				});
				this.mines = this.mines.filter((mine) => mine.uid !== m.uid);
			}
		}

		// Update heroes
		for (const h of this.heroes) {
			const cfg = HEROES[h.id];
			h.abilityCooldownTimer = Math.max(0, h.abilityCooldownTimer - dt);
			h.buffTimer = Math.max(0, h.buffTimer - dt);

			if (h.respawnTimer > 0) {
				h.respawnTimer = Math.max(0, h.respawnTimer - dt);
				if (h.respawnTimer === 0) h.hp = h.maxHp;
				continue;
			}

			// Move toward player command point
			const dx = h.targetX - h.x;
			const dy = h.targetY - h.y;
			const dist = Math.hypot(dx, dy);
			if (dist > 3) {
				const step = Math.min(dist, cfg.speed * dt);
				h.x += (dx / dist) * step;
				h.y += (dy / dist) * step;
			}

			// Auto-attack
			h.attackTimer -= dt * (h.buffTimer > 0 ? 3 : 1);
			if (h.attackTimer <= 0) {
				const target = this.enemies.find((e) => {
					const dom = ENEMIES[e.type].domain;
					const ok = cfg.targetDomain === 'both' || cfg.targetDomain === dom;
					return ok && Math.hypot(e.x - h.x, e.y - h.y) <= cfg.range;
				});
				if (target) {
					h.attackTimer = cfg.attackCooldown;
					this.dealDamage(target, cfg.damage, 0.25);
					this.effects.push({
						x: h.x, y: h.y, targetX: target.x, targetY: target.y,
						color: cfg.color, ttl: 0.12, maxTtl: 0.12, kind: 'beam'
					});
				}
			}
		}

		// Update visual effects
		for (const fx of [...this.effects]) {
			fx.ttl -= rawDt;
			if (fx.ttl <= 0) {
				this.effects = this.effects.filter((f) => f !== fx);
			}
		}
	}

	private handleUnitKilledByEnemy(unit: AlliedUnit, killer: ActiveEnemy) {
		// Level 3-4 Robot Line discharges electricity ONLY when killed by an enemy
		if (unit.deathShockDamage > 0) {
			this.dealDamage(killer, unit.deathShockDamage, 0.5);
			// Prevent infinite stun-lock per concept doc (minimum 3.5s immunity window)
			if (unit.deathStunDuration > 0 && this.simTime - killer.lastStunTime >= 3.5) {
				killer.stunTimer = unit.deathStunDuration;
				killer.lastStunTime = this.simTime;
			}
			this.effects.push({
				x: unit.x,
				y: unit.y,
				radius: 34,
				color: '#38bdf8',
				ttl: 0.35,
				maxTtl: 0.35,
				kind: 'circle'
			});
		}
		this.units = this.units.filter((u) => u.uid !== unit.uid);
	}
}

```

---

## 5. `src/routes/+page.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/game/state.svelte';
	import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
	import { TDGameEngine } from '$lib/game/engine';
	import type { TowerId, HeroId } from '$lib/game/types';

	let canvas = $state<HTMLCanvasElement null |>(null);
	const engine = new TDGameEngine();

	function beginBriefing() {
		game.screen = 'briefing';
	}

	function launchBattle() {
		game.startMission();
		engine.reset();
	}

	function handleCanvasClick(ev: MouseEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = 1100 / rect.width;
		const scaleY = 600 / rect.height;
		const x = (ev.clientX - rect.left) * scaleX;
		const y = (ev.clientY - rect.top) * scaleY;

		// Debug Path/Slot Editor mode for AI & Level tweaking
		if (game.editorMode) {
			if (ev.shiftKey) {
				game.mission.towerSlots = [
					...game.mission.towerSlots,
					{ id: `s${game.mission.towerSlots.length + 1}`, x: Math.round(x), y: Math.round(y) }
				];
			} else {
				game.mission.waypoints = [...game.mission.waypoints, { x: Math.round(x), y: Math.round(y) }];
			}
			return;
		}

		// 1. Check if clicked a hero
		for (const h of engine.heroes) {
			if (Math.hypot(h.x - x, h.y - y) <= 22) {
				game.activeHeroId = h.id;
				game.activeSlotId = null;
				return;
			}
		}

		// 2. Check if clicked a tower slot
		for (const slot of game.mission.towerSlots) {
			if (Math.hypot(slot.x - x, slot.y - y) <= 28) {
				game.activeSlotId = slot.id;
				game.activeHeroId = null;
				return;
			}
		}

		// 3. If a hero is selected and game is not paused, command movement
		if (game.activeHeroId && !game.isPaused) {
			engine.moveHero(game.activeHeroId, { x, y });
			return;
		}

		game.activeSlotId = null;
	}

	function renderCanvas(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, 1100, 600);

		// Workshop Industrial Background Grid
		ctx.fillStyle = '#0f172a';
		ctx.fillRect(0, 0, 1100, 600);
		ctx.strokeStyle = '#1e293b';
		ctx.lineWidth = 1;
		for (let gx = 0; gx < 1100; gx += 50) {
			ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 600); ctx.stroke();
		}
		for (let gy = 0; gy < 600; gy += 50) {
			ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(1100, gy); ctx.stroke();
		}

		// Draw Enemy Route
		const wps = game.mission.waypoints;
		if (wps.length > 1) {
			ctx.strokeStyle = '#334155';
			ctx.lineWidth = 44;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(wps[0].x, wps[0].y);
			for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
			ctx.stroke();

			ctx.strokeStyle = '#475569';
			ctx.lineWidth = 2;
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(wps[0].x, wps[0].y);
			for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
			ctx.stroke();
			ctx.setLineDash([]);

			// Breach Entry & Exit Portals
			ctx.fillStyle = '#ef4444';
			ctx.beginPath(); ctx.arc(wps[0].x, wps[0].y, 20, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#38bdf8';
			const exit = wps[wps.length - 1];
			ctx.beginPath(); ctx.arc(exit.x, exit.y, 22, 0, Math.PI * 2); ctx.fill();
		}

		// Draw Tower Slots & Built Towers
		for (const slot of game.mission.towerSlots) {
			const built = engine.towers.get(slot.id);
			const isSelected = game.activeSlotId === slot.id;

			if (isSelected && built) {
				const range = TOWERS[built.type].levels[built.level - 1].range;
				ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 1.5;
				ctx.beginPath(); ctx.arc(slot.x, slot.y, range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
			}

			ctx.fillStyle = built ? '#1e293b' : '#0f172a';
			ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
			ctx.lineWidth = isSelected ? 3 : 2;
			ctx.beginPath(); ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

			if (built) {
				const cfg = TOWERS[built.type];
				ctx.fillStyle = cfg.color;
				ctx.beginPath(); ctx.arc(slot.x, slot.y, 16, 0, Math.PI * 2); ctx.fill();
				ctx.fillStyle = '#0f172a';
				ctx.font = 'bold 12px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`L${built.level}`, slot.x, slot.y + 4);

				// Continuous Mining Laser Beam
				if (built.type === 'mining_laser' && built.laserTargetUid) {
					const target = engine.enemies.find((e) => e.uid === built.laserTargetUid);
					if (target) {
						ctx.strokeStyle = '#ef4444';
						ctx.lineWidth = 2 + built.level * 1.2;
						ctx.beginPath(); ctx.moveTo(slot.x, slot.y); ctx.lineTo(target.x, target.y); ctx.stroke();
					}
				}
			} else {
				ctx.fillStyle = '#64748b';
				ctx.font = 'bold 16px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText('+', slot.x, slot.y + 5);
			}
		}

		// Draw Mines
		for (const m of engine.mines) {
			ctx.fillStyle = m.armingTimer > 0 ? '#64748b' : '#a855f7';
			ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, Math.PI * 2); ctx.fill();
		}

		// Draw Allied Units (Robots & Exosuits)
		for (const u of engine.units) {
			ctx.fillStyle = u.towerType === 'robot_line' ? '#38bdf8' : '#10b981';
			ctx.beginPath(); ctx.arc(u.x, u.y, 9, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = '#0f172a';
			ctx.lineWidth = 2;
			ctx.stroke();

			// Battery bar for robots
			if (u.towerType === 'robot_line') {
				ctx.fillStyle = '#facc15';
				ctx.fillRect(u.x - 10, u.y - 14, 20 * (u.batteryTimer / u.maxBattery), 3);
			}
		}

		// Draw Enemies
		for (const e of engine.enemies) {
			const cfg = ENEMIES[e.type];
			ctx.fillStyle = cfg.color;
			ctx.beginPath();
			ctx.arc(e.x, e.y, cfg.radius, 0, Math.PI * 2);
			ctx.fill();

			if (cfg.domain === 'air') {
				ctx.strokeStyle = '#f8fafc';
				ctx.lineWidth = 2;
				ctx.stroke();
			}
			if (e.stunTimer > 0) {
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 3;
				ctx.stroke();
			}

			// Health bar
			const hpPct = Math.max(0, e.hp / e.maxHp);
			ctx.fillStyle = '#1e293b';
			ctx.fillRect(e.x - 14, e.y - cfg.radius - 9, 28, 4);
			ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
			ctx.fillRect(e.x - 14, e.y - cfg.radius - 9, 28 * hpPct, 4);
		}

		// Draw Heroes
		for (const h of engine.heroes) {
			const cfg = HEROES[h.id];
			const isSelected = game.activeHeroId === h.id;

			if (isSelected) {
				ctx.strokeStyle = '#facc15';
				ctx.lineWidth = 2;
				ctx.beginPath(); ctx.arc(h.x, h.y, 22, 0, Math.PI * 2); ctx.stroke();
			}

			ctx.fillStyle = h.respawnTimer > 0 ? '#475569' : cfg.color;
			ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.stroke();

			const hpPct = Math.max(0, h.hp / h.maxHp);
			ctx.fillStyle = '#0f172a';
			ctx.fillRect(h.x - 18, h.y - 25, 36, 5);
			ctx.fillStyle = '#38bdf8';
			ctx.fillRect(h.x - 18, h.y - 25, 36 * hpPct, 5);
		}

		// Draw Visual Effects
		for (const fx of engine.effects) {
			const alpha = Math.max(0, fx.ttl / fx.maxTtl);
			ctx.save();
			ctx.globalAlpha = alpha;
			if (fx.kind === 'circle' && fx.radius) {
				ctx.strokeStyle = fx.color;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(fx.x, fx.y, fx.radius * (1.1 - alpha * 0.3), 0, Math.PI * 2);
				ctx.stroke();
			} else if (fx.kind === 'beam' && fx.targetX !== undefined && fx.targetY !== undefined) {
				ctx.strokeStyle = fx.color;
				ctx.lineWidth = 3;
				ctx.beginPath(); ctx.moveTo(fx.x, fx.y); ctx.lineTo(fx.targetX, fx.targetY); ctx.stroke();
			} else if (fx.kind === 'text' && fx.text) {
				ctx.fillStyle = fx.color;
				ctx.font = 'bold 14px sans-serif';
				ctx.fillText(fx.text, fx.x, fx.y - (1 - alpha) * 20);
			}
			ctx.restore();
		}
	}

	onMount(() => {
		let last = performance.now();
		let raf: number;
		const loop = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;
			if (game.screen === 'playing') {
				engine.update(dt);
				if (canvas) {
					const ctx = canvas.getContext('2d');
					if (ctx) renderCanvas(ctx);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none">
	{#if game.screen === 'menu'}
		<div class="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<span class="text-xs font-bold uppercase tracking-widest text-amber-400">Космічна Tower Defense • Прототип</span>
					<h1 class="text-4xl font-extrabold mt-1">ОСТАННІЙ КОРАБЕЛЬ КОЛОНІЇ</h1>
					<p class="text-slate-400 mt-1">Цивільні спеціалісти перетворюють промислові інструменти на зброю</p>
				</div>
				<div class="text-right text-sm text-slate-400">
					<div>Кампанія: 4 райони / 20 місій</div>
					<div class="text-emerald-400 font-semibold">Доступно: Район 1 (Місія 01)</div>
				</div>
			</div>

			<!-- 4 Campaign Districts Overview -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
				<div class="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500">
					<div class="text-xs text-amber-400 font-bold">МІСІЇ 01–05</div>
					<div class="font-bold text-lg mt-1">1. Промислова околиця</div>
					<p class="text-xs text-slate-300 mt-1">Утримати майстерню та зібрати вцілілих робітників.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 06–10</div>
					<div class="font-bold text-lg mt-1">2. Житловий район</div>
					<p class="text-xs text-slate-400 mt-1">Евакуація лікарні та порятунок спеціалістів.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 11–15</div>
					<div class="font-bold text-lg mt-1">3. Видобуток і завод</div>
					<p class="text-xs text-slate-400 mt-1">Збір вузлів та палива для материнського корабля.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 16–20</div>
					<div class="font-bold text-lg mt-1">4. Космопорт</div>
					<p class="text-xs text-slate-400 mt-1">Запуск систем корабля та фінальна евакуація.</p>
				</div>
			</div>

			<div class="flex justify-end pt-2">
				<button
					onclick={() => (game.screen = 'loadout')}
					class="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-lg transition cursor-pointer"
				>
					Підготовка до Місії 01: Майстерня →
				</button>
			</div>
		</div>

	{:else if game.screen === 'loadout'}
		<div class="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
			<div class="flex justify-between items-center">
				<div>
					<h2 class="text-2xl font-bold">Комплектація загону перед місією</h2>
					<p class="text-slate-400 text-sm">Оберіть до 5 промислових установок ({game.selectedTowers.length}/5) та 2 героїв ({game.selectedHeroes.length}/2)</p>
				</div>
				<button onclick={() => (game.screen = 'menu')} class="text-sm text-slate-400 hover:text-white cursor-pointer">← Назад у меню</button>
			</div>

			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Інженерні вежі (Оберіть до 5 з 8)</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
					{#each Object.values(TOWERS) as t}
						{@const active = game.selectedTowers.includes(t.id)}
						<button
							onclick={() => game.toggleTowerInLoadout(t.id)}
							class="p-3 rounded-xl border text-left transition cursor-pointer {active ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'}"
						>
							<div class="flex items-center justify-between">
								<span class="font-bold text-sm" style="color: {t.color}">{t.name}</span>
								<span class="text-xs px-2 py-0.5 rounded bg-slate-900">{t.levels[0].cost}⚡</span>
							</div>
							<p class="text-xs text-slate-400 mt-1">{t.role}</p>
						</button>
					{/each}
				</div>
			</div>

			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Головні спеціалісти (Оберіть 2 з 5)</h3>
				<div class="grid grid-cols-1 md:grid-cols-5 gap-3">
					{#each Object.values(HEROES) as h}
						{@const active = game.selectedHeroes.includes(h.id)}
						<button
							onclick={() => game.toggleHeroInLoadout(h.id)}
							class="p-3 rounded-xl border text-left transition cursor-pointer {active ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/30' : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'}"
						>
							<div class="font-bold text-sm" style="color: {h.color}">{h.name}</div>
							<div class="text-[11px] text-slate-400">{h.profession}</div>
							<div class="mt-2 text-xs text-emerald-300 font-semibold">★ {h.abilityName}</div>
							<div class="text-[11px] text-slate-400">{h.abilityDesc}</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex justify-end">
				<button
					onclick={beginBriefing}
					class="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer"
				>
					Далі: Вступний брифінг →
				</button>
			</div>
		</div>

	{:else if game.screen === 'briefing'}
		<div class="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
			<div class="text-xs font-bold uppercase text-amber-400">{game.mission.district}</div>
			<h2 class="text-3xl font-extrabold">{game.mission.title}</h2>
			<p class="text-slate-400 text-sm">{game.mission.subtitle}</p>

			<div class="space-y-3 py-3">
				{#each game.mission.preMissionDialogue as line}
					<div class="p-4 rounded-xl bg-slate-950 border-l-4" style="border-color: {line.color}">
						<div class="text-sm font-bold" style="color: {line.color}">{line.speaker} <span class="text-xs text-slate-500">({line.role})</span></div>
						<p class="text-slate-200 text-sm mt-1">«{line.text}»</p>
					</div>
				{/each}
			</div>

			<div class="flex justify-between items-center pt-2">
				<button onclick={() => (game.screen = 'loadout')} class="text-sm text-slate-400 hover:text-white cursor-pointer">← Змінити набір</button>
				<button onclick={launchBattle} class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold cursor-pointer">
					До бою!
				</button>
			</div>
		</div>

	{:else if game.screen === 'playing'}
		<div class="w-full max-w-[1120px] space-y-2">
			<!-- Top HUD Bar -->
			<div class="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 gap-3">
				<div class="flex items-center gap-5">
					<div class="text-sm font-bold text-rose-400">❤️ Життя: <span class="text-lg">{game.lives}</span></div>
					<div class="text-sm font-bold text-amber-400">⚡ Ресурси: <span class="text-lg">{game.currency}</span></div>
					<div class="text-sm font-bold text-sky-400">🌊 Хвиля: <span class="text-lg">{game.currentWave} / {game.totalWaves}</span></div>
				</div>

				{#if !game.isPaused && game.currentWave < game.totalWaves}
					<button
						onclick={() => engine.callNextWave(true)}
						class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30 text-xs font-bold cursor-pointer"
					>
						🔔 Дострокова хвиля (+{game.mission.waves[game.currentWave].earlyCallBonus}⚡)
						{#if !game.waveActive}({Math.ceil(game.nextWaveCountdown)}с){/if}
					</button>
				{/if}

				<div class="flex items-center gap-2">
					<button
						onclick={() => (game.isPaused = !game.isPaused)}
						class="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer {game.isPaused ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 border-slate-700'}"
					>
						{game.isPaused ? '▶ Зняти з паузи' : '⏸ Пауза огляду'}
					</button>
					<button
						onclick={() => (game.gameSpeed = game.gameSpeed === 1 ? 2 : 1)}
						class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold cursor-pointer"
					>
						Швидкість ×{game.gameSpeed}
					</button>
					<button
						onclick={() => (game.editorMode = !game.editorMode)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 cursor-pointer"
						title="Клік: додати точку шляху, Shift+Клік: додати слот вежі"
					>
						{game.editorMode ? '🛠 Редактор ON' : '🛠'}
					</button>
					<button onclick={() => (game.screen = 'menu')} class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 cursor-pointer">Меню</button>
				</div>
			</div>

			{#if game.isPaused}
				<div class="bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs px-4 py-1.5 rounded-lg text-center">
					Пауза для огляду поля: за правилами концепту будівництво, накази героям та здібності під час паузи недоступні.
				</div>
			{/if}

			<!-- Main Interactive Battle Arena -->
			<div class="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
				<canvas
					bind:this={canvas}
					width="1100"
					height="600"
					onclick={handleCanvasClick}
					class="w-full h-auto block cursor-crosshair"
				></canvas>

				<!-- Victory / Defeat Modal -->
				{#if game.outcome !== 'none'}
					<div class="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-6">
						<div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
							{#if game.outcome === 'victory'}
								<div class="text-4xl">⭐⭐⭐</div>
								<h3 class="text-3xl font-extrabold text-emerald-400">МАЙСТЕРНЮ ВРЯТОВАНО!</h3>
								<p class="text-slate-300 text-sm">Зірок здобуто: {game.starsEarned} / 3 (Залишок життів: {game.lives})</p>
							{:else}
								<h3 class="text-3xl font-extrabold text-rose-500">ОБОРОНУ ПРОРВАНО</h3>
								<p class="text-slate-300 text-sm">Фауна захопила майстерню. Спробуйте іншу комбінацію веж!</p>
							{/if}
							<div class="flex gap-3 justify-center pt-2">
								<button onclick={launchBattle} class="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer">Зіграти знову</button>
								<button onclick={() => (game.screen = 'menu')} class="px-6 py-2.5 rounded-xl bg-slate-800 font-bold cursor-pointer">У меню</button>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Bottom Control Bar: Heroes & Selected Slot Inspector -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				<!-- Heroes Panel -->
				<div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3">
					{#each engine.heroes as h}
						{@const cfg = HEROES[h.id]}
						<div class="flex-1 p-2.5 rounded-lg bg-slate-950 border {game.activeHeroId === h.id ? 'border-amber-400' : 'border-slate-800'}">
							<div class="flex justify-between items-center">
								<button onclick={() => (game.activeHeroId = h.id)} class="font-bold text-xs cursor-pointer" style="color: {cfg.color}">
									{cfg.name}
								</button>
								<span class="text-[11px] text-slate-400">
									{h.respawnTimer > 0 ? `Відновлення ${Math.ceil(h.respawnTimer)}с` : `${Math.ceil(h.hp)}/${h.maxHp} HP`}
								</span>
							</div>
							<button
								disabled={game.isPaused || h.respawnTimer > 0 || h.abilityCooldownTimer > 0}
								onclick={() => engine.triggerHeroAbility(h.id)}
								class="mt-2 w-full py-1.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold disabled:opacity-40 cursor-pointer"
							>
								{h.abilityCooldownTimer > 0 ? `${cfg.abilityName} (${Math.ceil(h.abilityCooldownTimer)}с)` : `★ ${cfg.abilityName}`}
							</button>
						</div>
					{/each}
				</div>

				<!-- Tower Build / Upgrade Contextual Inspector -->
				<div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
					{#if game.activeSlotId}
						{@const existing = engine.towers.get(game.activeSlotId)}
						{#if !existing}
							<div class="text-xs text-slate-400 mb-2 font-bold">Оберіть установку для зведення на слоті #{game.activeSlotId}:</div>
							<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
								{#each game.selectedTowers as tid}
									{@const t = TOWERS[tid]}
									<button
										disabled={game.isPaused || game.currency < t.levels[0].cost}
										onclick={() => engine.buildTower(game.activeSlotId!, tid)}
										class="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 disabled:opacity-40 text-left cursor-pointer"
									>
										<div class="font-bold text-xs" style="color: {t.color}">{t.name}</div>
										<div class="text-[11px] text-amber-400 font-bold">{t.levels[0].cost}⚡</div>
									</button>
								{/each}
							</div>
						{:else}
							{@const cfg = TOWERS[existing.type]}
							{@const currStats = cfg.levels[existing.level - 1]}
							{@const nextStats = existing.level < 4 ? cfg.levels[existing.level] : null}
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<div class="font-bold text-sm" style="color: {cfg.color}">
										{cfg.name} (Рівень {existing.level}/4)
									</div>
									<p class="text-xs text-slate-400">{currStats.description}</p>
								</div>
								<div class="flex gap-2">
									{#if nextStats}
										<button
											disabled={game.isPaused || game.currency < nextStats.cost}
											onclick={() => engine.upgradeTower(existing.slotId)}
											class="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer"
										>
											Покращити до L{existing.level + 1} ({nextStats.cost}⚡)
										</button>
									{/if}
									<button
										disabled={game.isPaused}
										onclick={() => engine.sellTower(existing.slotId)}
										class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer"
									>
										Демонтаж
									</button>
								</div>
							</div>
						{/if}
					{:else}
						<div class="text-xs text-slate-400 flex items-center justify-between h-full">
							<span>💡 Клікніть на круглий будівельний слот (+), щоб звести вежу, або оберіть героя для переміщення по полю.</span>
							{#if game.editorMode}
								<button
									onclick={() => navigator.clipboard.writeText(JSON.stringify({ waypoints: game.mission.waypoints, towerSlots: game.mission.towerSlots }))}
									class="px-3 py-1 rounded bg-sky-500 text-slate-950 font-bold cursor-pointer"
								>
									Копіювати JSON мапи
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

```

---

## 6. Agent Execution Checklist

1. Initialize SvelteKit with Svelte 5 and TailwindCSS if not already initialized (`npx sv create . --template minimal --types ts`).
2. Place the 5 files above into their exact paths.
3. Run `npm run check` and `npm run dev` to verify zero TypeScript errors.
