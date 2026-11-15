import type { TowerId, EnemyId, HeroId } from '$lib/game/types';
import type { GameLocale } from './game';
import { TOWERS, HEROES, ENEMIES, MISSION_01 } from '$lib/game/configs';
import type { TowerConfig, HeroConfig, EnemyConfig, MissionConfig } from '$lib/game/types';

export interface TowerTranslation {
	name: string;
	role: string;
	levels: [string, string, string, string];
}

export interface HeroTranslation {
	name: string;
	profession: string;
	abilityName: string;
	abilityDesc: string;
}

export interface EnemyTranslation {
	name: string;
	traits?: string;
}

export interface MissionDialogueTranslation {
	speaker: string;
	role: string;
	text: string;
}

export interface MissionTranslation {
	district: string;
	title: string;
	subtitle: string;
	dialogue: MissionDialogueTranslation[];
}

export const CONTENT_I18N: Record<
	GameLocale,
	{
		towers: Record<TowerId, TowerTranslation>;
		heroes: Record<HeroId, HeroTranslation>;
		enemies: Record<EnemyId, EnemyTranslation>;
		missions: Record<string, MissionTranslation>;
	}
> = {
	uk: {
		towers: {
			robot_line: {
				name: 'Складальна лінія роботів',
				role: 'Затримка та ослаблення потоку (земля)',
				levels: [
					'Прості болванчики. Лише затримують ворога. Гинуть з одного удару.',
					'Інструмент та броня. Роботи живуть довше і б’ють робочим інструментом.',
					'Електричний модуль. При загибелі від ворога робот б’є струмом убивцю.',
					'Оглушуючий розряд. При загибелі завдає шкоди та оглушує ворога-вбивцю.'
				]
			},
			drill: {
				name: 'Бурова установка',
				role: 'Поштовхи та сповільнення в області (земля)',
				levels: [
					'Компактний бур. Сповільнює та підтрушує наземних ворогів поруч.',
					'Посилена основа. Більший радіус вібрації та сильніше сповільнення.',
					'Посилений привід. Охоплює значну ділянку маршруту.',
					'Повноцінна станція. Тотальний сейсмічний контроль широкої зони.'
				]
			},
			mining_laser: {
				name: 'Гірничодобувний лазер',
				role: 'Найбільша постійна шкода зблизька (земля/повітря)',
				levels: [
					'Ручний гірничий інструмент на штативі. Безперервний фокусований промінь.',
					'Стаціонарна версія. Посилена опора та потужніший випромінювач.',
					'Два спеціалісти. Другий робітник обслуговує батареї живлення.',
					'Місце оператора. Надпотужний плазмовий різак проти найміцніших цілей.'
				]
			},
			crane: {
				name: 'Будівельний кран',
				role: 'Рідкісні потужні удари по площі (земля)',
				levels: [
					'Скидає важкі будівельні вантажі на скупчення наземних ворогів.',
					'Подовжена стріла та важчі бетонні блоки.',
					'Подвійний трос. Значний радіус ударної хвилі.',
					'Важкий промисловий кран. Нищівна артилерійська підтримка.'
				]
			},
			fastener: {
				name: 'Кріпильний метальник',
				role: 'Універсальний дальній обстріл (земля/повітря)',
				levels: [
					'Промисловий анкерний стрілець. Швидко б’є наземні та повітряні цілі.',
					'Пневматичне подавання болтів. Вища швидкість і дальність.',
					'Магнітний прискорювач кріплення.',
					'Спарена автоматична турель важкого монтажу.'
				]
			},
			exosuit: {
				name: 'Платформа екзокостюмів',
				role: 'Стійкі бійці ближнього бою (земля)',
				levels: [
					'Двоє бійців у важких бурових екзокостюмах тримають позицію.',
					'Титанові пластини та гідравлічні кулаки.',
					'Посилені сервоприводи та вбудовані різаки.',
					'Три штурмові екзокостюми. Непорушна стіна оборони.'
				]
			},
			mine_layer: {
				name: 'Укладальник мін',
				role: 'Заряди на маршруті, шкода по площі (земля)',
				levels: [
					'Викладає до 3 промислових зарядів на дорогу. Короткий час зведення.',
					'До 4 зарядів одночасно, потужніша вибухівка.',
					'Швидке скидання нових мін одразу після підриву.',
					'Касетний мінний комплекс високої щільності.'
				]
			},
			pile_driver: {
				name: 'Горизонтальний сваєбій',
				role: 'Потужний одиночний удар, пробиття броні (земля)',
				levels: [
					'Важка гармата зі сваєбійного механізму. Ігнорує 50% броні цілі.',
					'Вольфрамовий стрижень. Ігнорує 65% броні.',
					'Пневмо-молот високого тиску. Ігнорує 80% броні.',
					'Надзвуковий сваєбій. Повністю прошиває будь-який панцир (100% пробиття).'
				]
			}
		},
		heroes: {
			fastener_hero: {
				name: 'Макс (Монтажник)',
				profession: 'Спеціаліст із важким метальником',
				abilityName: 'Турбо-привід',
				abilityDesc: 'Прискорює стрільбу втричі на 6 секунд'
			},
			exosuit_hero: {
				name: 'Борг (Оператор Екзо)',
				profession: 'Штурмовий буровий екзокостюм',
				abilityName: 'Титановий щит',
				abilityDesc: 'Відновлює 250 HP та оглушує ворогів навколо'
			},
			laser_hero: {
				name: 'Ірина (Лазерниця)',
				profession: 'Портативний гірничий різак',
				abilityName: 'Перевантаження променя',
				abilityDesc: 'Миттєвий імпульс на 280 шкоди по найсильнішій цілі поруч'
			},
			flamer_hero: {
				name: 'Влад (Вогнеметник)',
				profession: 'Термічна зачистка породи',
				abilityName: 'Вогняне кільце',
				abilityDesc: 'Підпалює землю навколо себе, спалюючи групу ворогів'
			},
			chemist_hero: {
				name: 'Док (Хімік-підривник)',
				profession: 'Промислові реагенти та вибухівка',
				abilityName: 'Кислотна хмара',
				abilityDesc: 'Отруює та руйнує броню всім ворогам у радіусі'
			}
		},
		enemies: {
			pack_hound: { name: 'Стайник' },
			runner: { name: 'Бігун' },
			armored_beetle: { name: 'Панцирник' },
			heavy_rhino: { name: 'Важковаговик' },
			jumper: { name: 'Стрибун' },
			glider: { name: 'Планер' },
			spore_carrier: { name: 'Спороносець' },
			spitter: { name: 'Плювальник' },
			shield_bearer: { name: 'Щитоносець' },
			broodmother: { name: 'Виводковик' }
		},
		missions: {
			mission_01: {
				district: 'Район 1: Промислова околиця',
				title: 'Місія 01: Майстерня',
				subtitle: 'Утримайте головний цех і перетворіть мирне обладнання на зброю оборони',
				dialogue: [
					{
						speaker: 'Макс (Монтажник)',
						role: 'Інженер кріплення',
						text: 'Вибух на шахті вивів із ладу периметр! Хвиля тварюк пре просто на нашу майстерню!'
					},
					{
						speaker: 'Борг (Оператор Екзо)',
						role: 'Буровий спеціаліст',
						text: 'Армії тут немає. Переналаштовуйте бури, гірничі лазери та конвеєри роботів. Ми дамо їм бій тим, що під рукою!'
					}
				]
			}
		}
	},
	en: {
		towers: {
			robot_line: {
				name: 'Robot Assembly Line',
				role: 'Delay & harass swarm units (ground)',
				levels: [
					'Basic decoy bots. Stall enemies briefly. Destroyed in one strike.',
					'Reinforced tools & plating. Bots survive longer and fight back.',
					'Shock discharge. When destroyed, bot retaliates with electric arc.',
					'Stun overload. Deals heavy damage and stuns attacking enemy on death.'
				]
			},
			drill: {
				name: 'Seismic Mining Drill',
				role: 'Ground shockwaves & AoE slow (ground)',
				levels: [
					'Compact drill. Slows down and destabilizes approaching hostiles.',
					'Reinforced chassis. Expanded tremor radius and stronger slow factor.',
					'Heavy drive unit. Tremors cover a broad sector of the pathway.',
					'Seismic control station. Absolute crowd control over wide perimeter.'
				]
			},
			mining_laser: {
				name: 'Heavy Plasma Laser',
				role: 'Highest continuous single-target DPS (ground/air)',
				levels: [
					'Tripod cutting beam. Continuous focused beam targeting hostiles.',
					'Stationary battery mount. Greater range and beam intensity.',
					'Dual-operator setup. Rapid heat dissipation and increased damage.',
					'Industrial plasma cutter. Obliterates heaviest armor and bosses.'
				]
			},
			crane: {
				name: 'Industrial Heavy Crane',
				role: 'Slow crushing artillery bombardment (ground)',
				levels: [
					'Drops massive construction salvage on concentrated ground targets.',
					'Extended crane boom. Heavier slabs with wider blast radius.',
					'Twin-cable hoist. Crushing kinetic shockwave across the road.',
					'Heavy orbital crane. Massive artillery bombardment wiping swarms.'
				]
			},
			fastener: {
				name: 'Riveter Fastener Sentry',
				role: 'Rapid all-domain projectile turret (ground/air)',
				levels: [
					'High-velocity pneumatic riveter. Hits ground and flying enemies.',
					'Bolt feeder enhancement. Higher fire rate and extended reach.',
					'Magnetic accelerator barrel. Armor-piercing fastener bolts.',
					'Dual rapid-fire gatling sentry. Relentless high-speed barrage.'
				]
			},
			exosuit: {
				name: 'Exosuit Guard Platform',
				role: 'Stalwart melee shock troopers (ground)',
				levels: [
					'Two mining pilots in reinforced exosuits blocking enemy passage.',
					'Titanium hull plates & hydraulic fists. Higher durability.',
					'High-output servos and thermal cutters for sustained combat.',
					'Three assault exosuits. An unyielding defensive bastion.'
				]
			},
			mine_layer: {
				name: 'Automated Mine Layer',
				role: 'Path hazards & burst explosive traps (ground)',
				levels: [
					'Deploys up to 3 industrial explosive charges directly on path.',
					'Capacity expanded to 4 mines. Enhanced explosive yield.',
					'Rapid automated dispenser immediately replaces detonated mines.',
					'Cluster munitions suite. Dense deadly hazard zone for ground swarms.'
				]
			},
			pile_driver: {
				name: 'Horizontal Pile Driver',
				role: 'Heavy sniper strike, pure armor pierce (ground)',
				levels: [
					'Heavy pneumatic cannon. Penetrates 50% of target armor.',
					'Tungsten core rod. Ignores 65% of target armor.',
					'Pressurized pneumatic ram. Bypasses 80% of enemy armor.',
					'Supersonic kinetic driver. Completely pierces all armor (100%).'
				]
			}
		},
		heroes: {
			fastener_hero: {
				name: 'Max (Fitter)',
				profession: 'Heavy Riveter Specialist',
				abilityName: 'Overdrive Mechanism',
				abilityDesc: 'Triples firing rate for 6 seconds'
			},
			exosuit_hero: {
				name: 'Borg (Exo Pilot)',
				profession: 'Assault Drill Exosuit',
				abilityName: 'Titanium Barrier',
				abilityDesc: 'Restores 250 HP and stuns adjacent hostiles'
			},
			laser_hero: {
				name: 'Irina (Laser Operator)',
				profession: 'Portable Thermal Cutter',
				abilityName: 'Beam Surge',
				abilityDesc: 'Instant focused pulse dealing 280 damage to strongest foe'
			},
			flamer_hero: {
				name: 'Vlad (Flamethrower)',
				profession: 'Thermal Debris Cleaner',
				abilityName: 'Fire Ring',
				abilityDesc: 'Ignites surrounding terrain, incinerating clustered enemies'
			},
			chemist_hero: {
				name: 'Doc (Demolitions Chemist)',
				profession: 'Industrial Reagents & Explosives',
				abilityName: 'Acid Cloud',
				abilityDesc: 'Poisons and melts armor of all hostiles within radius'
			}
		},
		enemies: {
			pack_hound: { name: 'Pack Hound' },
			runner: { name: 'Runner' },
			armored_beetle: { name: 'Armored Beetle' },
			heavy_rhino: { name: 'Heavy Rhino' },
			jumper: { name: 'Jumper' },
			glider: { name: 'Glider' },
			spore_carrier: { name: 'Spore Carrier' },
			spitter: { name: 'Spitter' },
			shield_bearer: { name: 'Shield Bearer' },
			broodmother: { name: 'Broodmother' }
		},
		missions: {
			mission_01: {
				district: 'District 1: Industrial Outskirts',
				title: 'Mission 01: Workshop',
				subtitle: 'Hold the main facility and repurpose civilian tools into defensive weapons',
				dialogue: [
					{
						speaker: 'Max (Fitter)',
						role: 'Fastener Engineer',
						text: 'Mine explosion compromised our perimeter! Mutants are swarming the workshop!'
					},
					{
						speaker: 'Borg (Exo Pilot)',
						role: 'Drill Specialist',
						text: 'No military is coming. Repurpose the drills, lasers, and assembly lines. We fight with what we have!'
					}
				]
			}
		}
	}
};

export function getLocalizedTower(id: TowerId, locale: GameLocale = 'uk'): TowerConfig {
	const base = TOWERS[id];
	const trans = CONTENT_I18N[locale]?.towers[id] ?? CONTENT_I18N.uk.towers[id];
	return {
		...base,
		name: trans.name,
		role: trans.role,
		levels: [
			{ ...base.levels[0], description: trans.levels[0] },
			{ ...base.levels[1], description: trans.levels[1] },
			{ ...base.levels[2], description: trans.levels[2] },
			{ ...base.levels[3], description: trans.levels[3] }
		]
	};
}

export function getLocalizedHero(id: HeroId, locale: GameLocale = 'uk'): HeroConfig {
	const base = HEROES[id];
	const trans = CONTENT_I18N[locale]?.heroes[id] ?? CONTENT_I18N.uk.heroes[id];
	return {
		...base,
		name: trans.name,
		profession: trans.profession,
		abilityName: trans.abilityName,
		abilityDesc: trans.abilityDesc
	};
}

export function getLocalizedEnemy(id: EnemyId, locale: GameLocale = 'uk'): EnemyConfig {
	const base = ENEMIES[id];
	const trans = CONTENT_I18N[locale]?.enemies[id] ?? CONTENT_I18N.uk.enemies[id];
	return {
		...base,
		name: trans.name
	};
}

export function getLocalizedMission(
	missionId: string = 'mission_01',
	locale: GameLocale = 'uk'
): MissionConfig {
	const base = MISSION_01;
	const trans = CONTENT_I18N[locale]?.missions[missionId] ?? CONTENT_I18N.uk.missions[missionId];
	if (!trans) return base;

	return {
		...base,
		district: trans.district,
		title: trans.title,
		subtitle: trans.subtitle,
		preMissionDialogue: base.preMissionDialogue.map((d, idx) => {
			const dTrans = trans.dialogue[idx];
			if (!dTrans) return d;
			return {
				...d,
				speaker: dTrans.speaker,
				role: dTrans.role,
				text: dTrans.text
			};
		})
	};
}
