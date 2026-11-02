import type {
	TowerConfig,
	EnemyConfig,
	HeroConfig,
	MissionConfig,
	TowerId,
	EnemyId,
	HeroId
} from './types';

export const TOWERS: Record<TowerId, TowerConfig> = {
	robot_line: {
		id: 'robot_line',
		name: 'Складальна лінія роботів',
		role: 'Затримка та ослаблення потоку (земля)',
		targetDomain: 'ground',
		color: '#38bdf8',
		levels: [
			{
				level: 1,
				cost: 70,
				range: 115,
				damage: 0,
				cooldown: 0,
				spawnInterval: 4.5,
				maxUnits: 3,
				unitHp: 1,
				unitDamage: 0,
				unitBattery: 12,
				description: 'Прості болванчики. Лише затримують ворога. Гинуть з одного удару.'
			},
			{
				level: 2,
				cost: 90,
				range: 125,
				damage: 0,
				cooldown: 0,
				spawnInterval: 4.0,
				maxUnits: 3,
				unitHp: 65,
				unitDamage: 10,
				unitBattery: 15,
				description: 'Інструмент та броня. Роботи живуть довше і б’ють робочим інструментом.'
			},
			{
				level: 3,
				cost: 130,
				range: 130,
				damage: 0,
				cooldown: 0,
				spawnInterval: 3.6,
				maxUnits: 4,
				unitHp: 95,
				unitDamage: 16,
				unitBattery: 16,
				deathShockDamage: 55,
				description: 'Електричний модуль. При загибелі від ворога робот б’є струмом убивцю.'
			},
			{
				level: 4,
				cost: 180,
				range: 140,
				damage: 0,
				cooldown: 0,
				spawnInterval: 3.2,
				maxUnits: 4,
				unitHp: 130,
				unitDamage: 22,
				unitBattery: 18,
				deathShockDamage: 90,
				deathStunDuration: 1.4,
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
				level: 1,
				cost: 80,
				range: 105,
				damage: 12,
				cooldown: 1.8,
				aoeRadius: 105,
				slowFactor: 0.3,
				slowDuration: 1.5,
				description: 'Компактний бур. Сповільнює та підтрушує наземних ворогів поруч.'
			},
			{
				level: 2,
				cost: 100,
				range: 125,
				damage: 20,
				cooldown: 1.7,
				aoeRadius: 125,
				slowFactor: 0.4,
				slowDuration: 1.8,
				description: 'Посилена основа. Більший радіус вібрації та сильніше сповільнення.'
			},
			{
				level: 3,
				cost: 140,
				range: 145,
				damage: 32,
				cooldown: 1.6,
				aoeRadius: 145,
				slowFactor: 0.5,
				slowDuration: 2.1,
				description: 'Посилений привід. Охоплює значну ділянку маршруту.'
			},
			{
				level: 4,
				cost: 200,
				range: 170,
				damage: 50,
				cooldown: 1.5,
				aoeRadius: 170,
				slowFactor: 0.65,
				slowDuration: 2.5,
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
				level: 1,
				cost: 100,
				range: 120,
				damage: 45,
				cooldown: 0.1,
				description: 'Кустарна переробка. Неперервний промінь по одній цілі на малій дистанції.'
			},
			{
				level: 2,
				cost: 120,
				range: 135,
				damage: 75,
				cooldown: 0.1,
				description: 'Стаціонарна версія. Посилена опора та потужніший випромінювач.'
			},
			{
				level: 3,
				cost: 160,
				range: 150,
				damage: 115,
				cooldown: 0.1,
				description: 'Два спеціалісти. Другий робітник обслуговує батареї живлення.'
			},
			{
				level: 4,
				cost: 220,
				range: 165,
				damage: 175,
				cooldown: 0.1,
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
				level: 1,
				cost: 110,
				range: 210,
				damage: 55,
				cooldown: 3.2,
				aoeRadius: 65,
				description: 'Скидає важкі будівельні вантажі на скупчення наземних ворогів.'
			},
			{
				level: 2,
				cost: 130,
				range: 230,
				damage: 90,
				cooldown: 3.0,
				aoeRadius: 75,
				description: 'Подовжена стріла та важчі бетонні блоки.'
			},
			{
				level: 3,
				cost: 170,
				range: 250,
				damage: 140,
				cooldown: 2.8,
				aoeRadius: 85,
				description: 'Подвійний трос. Значний радіус ударної хвилі.'
			},
			{
				level: 4,
				cost: 230,
				range: 275,
				damage: 220,
				cooldown: 2.6,
				aoeRadius: 100,
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
				level: 1,
				cost: 65,
				range: 175,
				damage: 18,
				cooldown: 0.75,
				description: 'Промисловий анкерний стрілець. Швидко б’є наземні та повітряні цілі.'
			},
			{
				level: 2,
				cost: 85,
				range: 195,
				damage: 30,
				cooldown: 0.68,
				description: 'Пневматичне подавання болтів. Вища швидкість і дальність.'
			},
			{
				level: 3,
				cost: 120,
				range: 215,
				damage: 46,
				cooldown: 0.6,
				description: 'Магнітний прискорювач кріплення.'
			},
			{
				level: 4,
				cost: 165,
				range: 240,
				damage: 70,
				cooldown: 0.5,
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
				level: 1,
				cost: 105,
				range: 120,
				damage: 0,
				cooldown: 0,
				spawnInterval: 7.0,
				maxUnits: 2,
				unitHp: 180,
				unitDamage: 18,
				unitBattery: 999,
				description: 'Двоє бійців у важких бурових екзокостюмах тримають позицію.'
			},
			{
				level: 2,
				cost: 130,
				range: 125,
				damage: 0,
				cooldown: 0,
				spawnInterval: 6.5,
				maxUnits: 2,
				unitHp: 260,
				unitDamage: 28,
				unitBattery: 999,
				description: 'Титанові пластини та гідравлічні кулаки.'
			},
			{
				level: 3,
				cost: 170,
				range: 130,
				damage: 0,
				cooldown: 0,
				spawnInterval: 6.0,
				maxUnits: 2,
				unitHp: 370,
				unitDamage: 42,
				unitBattery: 999,
				description: 'Посилені сервоприводи та вбудовані різаки.'
			},
			{
				level: 4,
				cost: 220,
				range: 140,
				damage: 0,
				cooldown: 0,
				spawnInterval: 5.5,
				maxUnits: 3,
				unitHp: 500,
				unitDamage: 60,
				unitBattery: 999,
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
				level: 1,
				cost: 85,
				range: 135,
				damage: 65,
				cooldown: 3.5,
				aoeRadius: 60,
				maxUnits: 3,
				description: 'Викладає до 3 промислових зарядів на дорогу. Короткий час зведення.'
			},
			{
				level: 2,
				cost: 110,
				range: 145,
				damage: 105,
				cooldown: 3.0,
				aoeRadius: 70,
				maxUnits: 4,
				description: 'До 4 зарядів одночасно, потужніша вибухівка.'
			},
			{
				level: 3,
				cost: 150,
				range: 155,
				damage: 160,
				cooldown: 2.6,
				aoeRadius: 80,
				maxUnits: 5,
				description: 'Швидке скидання нових мін одразу після підриву.'
			},
			{
				level: 4,
				cost: 200,
				range: 165,
				damage: 240,
				cooldown: 2.2,
				aoeRadius: 95,
				maxUnits: 6,
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
				level: 1,
				cost: 115,
				range: 230,
				damage: 95,
				cooldown: 3.4,
				armorPierce: 0.5,
				description: 'Важка гармата зі сваєбійного механізму. Ігнорує 50% броні цілі.'
			},
			{
				level: 2,
				cost: 140,
				range: 250,
				damage: 155,
				cooldown: 3.1,
				armorPierce: 0.65,
				description: 'Вольфрамовий стрижень. Ігнорує 65% броні.'
			},
			{
				level: 3,
				cost: 185,
				range: 270,
				damage: 245,
				cooldown: 2.8,
				armorPierce: 0.8,
				description: 'Пневмо-молот високого тиску. Ігнорує 80% броні.'
			},
			{
				level: 4,
				cost: 240,
				range: 300,
				damage: 380,
				cooldown: 2.5,
				armorPierce: 1.0,
				description: 'Надзвуковий сваєбій. Повністю прошиває будь-який панцир (100% пробиття).'
			}
		]
	}
};

export const ENEMIES: Record<EnemyId, EnemyConfig> = {
	pack_hound: {
		id: 'pack_hound',
		name: 'Стайник',
		domain: 'ground',
		hp: 85,
		speed: 62,
		armor: 0,
		damage: 12,
		reward: 12,
		lifeCost: 1,
		radius: 11,
		color: '#94a3b8'
	},
	runner: {
		id: 'runner',
		name: 'Бігун',
		domain: 'ground',
		hp: 55,
		speed: 108,
		armor: 0,
		damage: 8,
		reward: 14,
		lifeCost: 1,
		radius: 9,
		color: '#38bdf8'
	},
	armored_beetle: {
		id: 'armored_beetle',
		name: 'Панцирник',
		domain: 'ground',
		hp: 260,
		speed: 36,
		armor: 0.65,
		damage: 22,
		reward: 28,
		lifeCost: 2,
		radius: 15,
		color: '#8b5cf6'
	},
	heavy_rhino: {
		id: 'heavy_rhino',
		name: 'Важковаговик',
		domain: 'ground',
		hp: 580,
		speed: 28,
		armor: 0.35,
		damage: 45,
		reward: 45,
		lifeCost: 3,
		radius: 18,
		color: '#dc2626'
	},
	jumper: {
		id: 'jumper',
		name: 'Стрибун',
		domain: 'ground',
		hp: 140,
		speed: 78,
		armor: 0.1,
		damage: 18,
		reward: 22,
		lifeCost: 1,
		radius: 12,
		color: '#eab308',
		canJump: true,
		jumpCooldown: 4.5
	},
	glider: {
		id: 'glider',
		name: 'Планер',
		domain: 'air',
		hp: 130,
		speed: 68,
		armor: 0,
		damage: 0,
		reward: 20,
		lifeCost: 2,
		radius: 13,
		color: '#a855f7'
	},
	spore_carrier: {
		id: 'spore_carrier',
		name: 'Спороносець',
		domain: 'air',
		hp: 240,
		speed: 45,
		armor: 0.15,
		damage: 0,
		reward: 35,
		lifeCost: 2,
		radius: 16,
		color: '#c084fc',
		periodicSpawn: { id: 'pack_hound', interval: 5.5 }
	},
	spitter: {
		id: 'spitter',
		name: 'Плювальник',
		domain: 'ground',
		hp: 120,
		speed: 52,
		armor: 0,
		damage: 10,
		rangedDamage: 24,
		rangedRange: 130,
		reward: 24,
		lifeCost: 1,
		radius: 12,
		color: '#84cc16'
	},
	shield_bearer: {
		id: 'shield_bearer',
		name: 'Щитоносець',
		domain: 'ground',
		hp: 210,
		speed: 46,
		armor: 0.25,
		damage: 15,
		reward: 30,
		lifeCost: 2,
		radius: 14,
		color: '#06b6d4',
		shieldAuraRadius: 85
	},
	broodmother: {
		id: 'broodmother',
		name: 'Виводковик',
		domain: 'ground',
		hp: 340,
		speed: 38,
		armor: 0.2,
		damage: 25,
		reward: 36,
		lifeCost: 2,
		radius: 17,
		color: '#f43f5e',
		spawnsOnDeath: { id: 'runner', count: 3 }
	}
};

export const HEROES: Record<HeroId, HeroConfig> = {
	fastener_hero: {
		id: 'fastener_hero',
		name: 'Макс (Монтажник)',
		profession: 'Спеціаліст із важким метальником',
		targetDomain: 'both',
		hp: 320,
		speed: 125,
		damage: 26,
		attackCooldown: 0.55,
		range: 175,
		respawnTime: 12,
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
		hp: 650,
		speed: 95,
		damage: 38,
		attackCooldown: 0.9,
		range: 40,
		respawnTime: 15,
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
		hp: 280,
		speed: 115,
		damage: 55,
		attackCooldown: 0.35,
		range: 145,
		respawnTime: 12,
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
		hp: 420,
		speed: 105,
		damage: 22,
		attackCooldown: 0.4,
		range: 95,
		respawnTime: 14,
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
		hp: 300,
		speed: 115,
		damage: 30,
		attackCooldown: 0.8,
		range: 160,
		respawnTime: 12,
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
