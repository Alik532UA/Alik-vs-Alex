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

	// Target domains
	targetLabel: string;
	targetGround: string;
	targetAir: string;
	targetBoth: string;

	// Stats labels
	towerCost: string;
	towerRange: string;
	towerDamage: string;
	robotDamage: string;
	robotHp: string;
	robotCount: string;
	levelLabel: string;

	// Encyclopedia & UI
	encyclopediaTitle: string;
	encyclopediaSubtitle: string;
	tabTowers: string;
	tabEnemies: string;
	tabHeroes: string;
	backToGame: string;
	missionSquad: string;
	selectTowersHelp: string;
	selectHeroesHelp: string;
	heroInspectorTitle: string;
	heroStatsHp: string;
	heroStatsDamage: string;
	heroStatsRange: string;
	heroStatsCooldown: string;
	limitReached: string;
	inSquad: string;
	selectedBadge: string;
	btnBriefing: string;
	btnToBattle: string;
	btnChangeLoadout: string;
}

export const GAME_I18N: Record<GameLocale, GameTranslations> = {
	uk: {
		title: 'Алік проти Алекса',
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
		hotkeysHelp: 'Пробіл: пауза, 1-2: швидкість, Стрілки: сітка, Enter: будівництво',

		targetLabel: 'Ціль',
		targetGround: 'земля',
		targetAir: 'повітря',
		targetBoth: 'земля + повітря',

		towerCost: 'Вартість',
		towerRange: 'Радіус',
		towerDamage: 'Шкода',
		robotDamage: 'Шкода робота',
		robotHp: 'HP робота',
		robotCount: 'Ліміт ботів',
		levelLabel: 'Рівень',

		encyclopediaTitle: 'Довідник обладнання та фауни',
		encyclopediaSubtitle: 'Повний каталог промислової зброї колонії та ворожих мутантів',
		tabTowers: 'Вежі (8 типів / 32 рівні)',
		tabEnemies: 'Фауна (10 ворогів)',
		tabHeroes: 'Спеціалісти (5 героїв)',
		backToGame: 'Повернутися до гри',
		missionSquad: 'Бойовий склад місії',
		selectTowersHelp: 'Інженерні установки (Оберіть від 1 до 5)',
		selectHeroesHelp: 'Головні спеціалісти (Оберіть 1 або 2)',
		heroInspectorTitle: 'Інспектор спеціаліста',
		heroStatsHp: 'Здоров’я',
		heroStatsDamage: 'Шкода',
		heroStatsRange: 'Радіус',
		heroStatsCooldown: 'Кулдаун',
		limitReached: 'Ліміт вичерпано. Зніміть вибір з іншого елемента.',
		inSquad: 'В загоні',
		selectedBadge: 'Обрано',
		btnBriefing: 'Далі: Вступний брифінг →',
		btnToBattle: 'До бою!',
		btnChangeLoadout: '← Змінити набір'
	},
	en: {
		title: 'Alik vs Alex',
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
		hotkeysHelp: 'Space: pause, 1-2: speed, Arrows: grid, Enter: build',

		targetLabel: 'Target',
		targetGround: 'ground',
		targetAir: 'air',
		targetBoth: 'ground + air',

		towerCost: 'Cost',
		towerRange: 'Range',
		towerDamage: 'Damage',
		robotDamage: 'Bot Damage',
		robotHp: 'Bot HP',
		robotCount: 'Bot Limit',
		levelLabel: 'Level',

		encyclopediaTitle: 'Equipment & Fauna Guide',
		encyclopediaSubtitle: 'Full catalog of industrial colony weaponry and mutant hostiles',
		tabTowers: 'Towers (8 types / 32 levels)',
		tabEnemies: 'Fauna (10 enemies)',
		tabHeroes: 'Specialists (5 heroes)',
		backToGame: 'Back to Game',
		missionSquad: 'Mission Squad Roster',
		selectTowersHelp: 'Engineering Towers (Select 1 to 5)',
		selectHeroesHelp: 'Lead Specialists (Select 1 or 2)',
		heroInspectorTitle: 'Specialist Inspector',
		heroStatsHp: 'Health',
		heroStatsDamage: 'Damage',
		heroStatsRange: 'Range',
		heroStatsCooldown: 'Cooldown',
		limitReached: 'Limit reached. Deselect an item first.',
		inSquad: 'In Squad',
		selectedBadge: 'Selected',
		btnBriefing: 'Next: Mission Briefing →',
		btnToBattle: 'To Battle!',
		btnChangeLoadout: '← Change Loadout'
	}
};

export function getTranslation(locale: GameLocale = 'uk'): GameTranslations {
	const t = GAME_I18N[locale];
	if (!t) return GAME_I18N.uk;
	return t;
}

export function getTargetDomainLabel(
	domain: 'ground' | 'air' | 'both',
	locale: GameLocale = 'uk'
): string {
	const t = getTranslation(locale);
	if (domain === 'both') return t.targetBoth;
	if (domain === 'air') return t.targetAir;
	return t.targetGround;
}
