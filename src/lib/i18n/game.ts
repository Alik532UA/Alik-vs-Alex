export type GameLocale = 'uk' | 'en';

export interface GameTranslations {
	title: string;
	subtitle: string;
	waves: string;
	scrap: string;
	health: string;
	startWave: string;
	pause: string;
	resume: string;
	speed: string;
	victory: string;
	defeat: string;
	restart: string;
	gridCursor: string;
	towerPlaced: string;
	insufficientScrap: string;
	hotkeysHelp: string;
}

export const GAME_I18N: Record<GameLocale, GameTranslations> = {
	uk: {
		title: 'Алік проти Сахка',
		subtitle: 'Тактична оборона космічної майстерні',
		waves: 'Хвиля',
		scrap: 'Брухт',
		health: 'Міцність бази',
		startWave: 'Розпочати хвилю',
		pause: 'Пауза',
		resume: 'Продовжити',
		speed: 'Швидкість',
		victory: 'Перемога! Сектор зачищено',
		defeat: 'Майстерню зруйновано!',
		restart: 'Грати знову',
		gridCursor: 'Курсор сітки',
		towerPlaced: 'Вежу збудовано',
		insufficientScrap: 'Недостатньо брухту для будівництва',
		hotkeysHelp: 'Пробіл: пауза, 1-2: швидкість, Стрілки: сітка, Enter: будівництво'
	},
	en: {
		title: 'Alik vs Sahko',
		subtitle: 'Space Colony Workshop Tower Defense',
		waves: 'Wave',
		scrap: 'Scrap',
		health: 'Base Health',
		startWave: 'Start Wave',
		pause: 'Pause',
		resume: 'Resume',
		speed: 'Speed',
		victory: 'Victory! Sector Cleared',
		defeat: 'Workshop Overrun!',
		restart: 'Play Again',
		gridCursor: 'Grid Cursor',
		towerPlaced: 'Tower Deployed',
		insufficientScrap: 'Not enough scrap to construct',
		hotkeysHelp: 'Space: pause, 1-2: speed, Arrows: grid, Enter: build'
	}
};

export function getTranslation(locale: GameLocale = 'uk'): GameTranslations {
	const t = GAME_I18N[locale];
	if (!t) return GAME_I18N.uk;
	return t;
}
