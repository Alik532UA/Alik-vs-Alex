import type { TowerId, HeroId } from './types';

export interface LoadoutPreset {
	id: 'balance' | 'heavy' | 'control';
	name: string;
	icon: string;
	description: string;
	towers: TowerId[];
	heroes: HeroId[];
}

export const ALL_TOWERS: TowerId[] = [
	'robot_line',
	'drill',
	'mining_laser',
	'crane',
	'fastener',
	'exosuit',
	'mine_layer',
	'pile_driver'
];

export const ALL_HEROES: HeroId[] = [
	'fastener_hero',
	'exosuit_hero',
	'laser_hero',
	'flamer_hero',
	'chemist_hero'
];

export const LOADOUT_PRESETS: Record<'balance' | 'heavy' | 'control', LoadoutPreset> = {
	balance: {
		id: 'balance',
		name: 'Баланс',
		icon: 'shield',
		description: 'Універсальний набір: затримка, лазер, пробиття та монтаж',
		towers: ['robot_line', 'drill', 'mining_laser', 'fastener', 'pile_driver'],
		heroes: ['fastener_hero', 'exosuit_hero']
	},
	heavy: {
		id: 'heavy',
		name: 'Важкий',
		icon: 'bomb',
		description: 'Бронебійні знаряддя, важкі крани та штурмові екзокостюми',
		towers: ['pile_driver', 'crane', 'exosuit', 'drill', 'mining_laser'],
		heroes: ['exosuit_hero', 'laser_hero']
	},
	control: {
		id: 'control',
		name: 'Контроль',
		icon: 'wind',
		description: 'Сповільнення сейсмікою, мінні загородження та площадна зачистка',
		towers: ['drill', 'mine_layer', 'robot_line', 'crane', 'fastener'],
		heroes: ['flamer_hero', 'chemist_hero']
	}
};

export function getRandomLoadout(): { towers: TowerId[]; heroes: HeroId[] } {
	const shuffledTowers = [...ALL_TOWERS].sort(() => Math.random() - 0.5);
	const towers = shuffledTowers.slice(0, 5);

	const shuffledHeroes = [...ALL_HEROES].sort(() => Math.random() - 0.5);
	const heroes = shuffledHeroes.slice(0, 2);

	return { towers, heroes };
}
