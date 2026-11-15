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
	btnBackToMenu: string;
	btnPrepareMission: string;
	manualBtn: string;
	manualFullBtn: string;
	menuBadge: string;
	menuTitle: string;
	menuSubtitle: string;
	campaignOverview: string;
	availableDistrict: string;
	district1Name: string;
	district1Desc: string;
	district2Name: string;
	district2Desc: string;
	district3Name: string;
	district3Desc: string;
	district4Name: string;
	district4Desc: string;
	missionsLabel: string;
	loadoutTitle: string;
	loadoutSubtitle: string;
	presetsLabel: string;
	presetRandom: string;
	presetBalance: string;
	presetHeavy: string;
	presetControl: string;
	presetClear: string;
	towerInspectorTitle: string;
	inspectHint: string;
	addToSquad: string;
	removeFromSquad: string;
	freeSlot: string;
	squadFullTower: string;
	squadFullHero: string;
	readyToDeploy: string;
	needMoreUnits: string;
	specialistsSquad: string;
	towersSquad: string;
	towersCountLabel: string;
	specialistsCountLabel: string;

	// Tooltips and notices
	presetRandomTooltip: string;
	presetBalanceTooltip: string;
	presetHeavyTooltip: string;
	presetControlTooltip: string;
	presetClearTooltip: string;
	secondsSuffix: string;
	selectMinTowerWarning: string;
	selectMinHeroWarning: string;
	challengeSquadNotice: string;

	// Encyclopedia & traits
	closeModal: string;
	speedLabel: string;
	armorLabel: string;
	jumpTrait: string;
	spawnsOnDeathTrait: string;
	periodicSpawnTrait: string;
	shieldAuraTrait: string;
	basicUnitTrait: string;

	// In-game HUD & controls
	hudLives: string;
	hudScrap: string;
	hudWave: string;
	earlyWaveBtn: string;
	tacticalPause: string;
	editorTooltip: string;
	editorOn: string;
	menuBtn: string;
	pauseOverlayNotice: string;
	canvasAriaLabel: string;
	victoryTitle: string;
	victoryStars: string;
	remainingLives: string;
	defeatTitle: string;
	defeatSubtitle: string;
	toMenuBtn: string;
	selectTowerBuildSlot: string;
	upgradeTowerTo: string;
	demolishTower: string;
	slotInstructionHint: string;
	copyMapJsonBtn: string;
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
		btnChangeLoadout: '← Змінити набір',
		btnBackToMenu: '← Назад у меню',
		btnPrepareMission: 'Підготовка до Місії 01: Майстерня →',
		manualBtn: 'Довідник',
		manualFullBtn: 'Довідник обладнання та фауни (47 артів)',
		menuBadge: 'Космічна Tower Defense • Повна графіка',
		menuTitle: 'ОСТАННІЙ КОРАБЕЛЬ КОЛОНІЇ',
		menuSubtitle: 'Цивільні спеціалісти перетворюють промислові інструменти на зброю',
		campaignOverview: 'Кампанія: 4 райони / 20 місій',
		availableDistrict: 'Доступно: Район 1 (Місія 01)',
		district1Name: '1. Промислова околиця',
		district1Desc: 'Утримати майстерню та зібрати вцілілих робітників.',
		district2Name: '2. Житловий район',
		district2Desc: 'Евакуація лікарні та порятунок спеціалістів.',
		district3Name: '3. Видобуток і завод',
		district3Desc: 'Збір вузлів та палива для материнського корабля.',
		district4Name: '4. Космопорт',
		district4Desc: 'Запуск систем корабля та фінальна евакуація.',
		missionsLabel: 'МІСІЇ',
		loadoutTitle: 'Комплектація загону перед місією',
		loadoutSubtitle: 'Оберіть установки (1–5) та спеціалістів (1–2)',
		presetsLabel: 'Пресети:',
		presetRandom: 'Випадковий',
		presetBalance: 'Баланс',
		presetHeavy: 'Важкий',
		presetControl: 'Контроль',
		presetClear: 'Очистити',
		towerInspectorTitle: 'Інспектор установки',
		inspectHint: 'Натисніть на будь-яку картку для перегляду характеристик',
		addToSquad: 'Додати до загону',
		removeFromSquad: 'Вилучити із загону',
		freeSlot: 'Вільний слот',
		squadFullTower: '5/5 Ліміт',
		squadFullHero: '2/2 Ліміт',
		readyToDeploy: 'Загін сформовано і готовий до висадки',
		needMoreUnits: 'Оберіть щонайменше 1 установку та 1 спеціаліста',
		specialistsSquad: 'Спеціалісти загону:',
		towersSquad: 'Установки загону:',
		towersCountLabel: 'Установки',
		specialistsCountLabel: 'Спеціалісти',

		presetRandomTooltip: 'Згенерувати 5 випадкових веж та 2 випадкових героїв',
		presetBalanceTooltip: 'Універсальний набір: затримка, лазер, пробиття та монтаж',
		presetHeavyTooltip: 'Бронебійні знаряддя, важкі крани та штурмові екзокостюми',
		presetControlTooltip: 'Сповільнення сейсмікою, мінні загородження та зачистка',
		presetClearTooltip: 'Скинути весь вибір (0 веж, 0 героїв)',
		secondsSuffix: 'с',
		selectMinTowerWarning: 'Оберіть щонайменше 1 інженерну вежу для захисту.',
		selectMinHeroWarning: 'Оберіть щонайменше 1 спеціаліста (героя).',
		challengeSquadNotice: 'Челендж-склад ({towers}/5 веж, {heroes}/2 героїв). Гра буде складнішою!',

		closeModal: 'Закрити',
		speedLabel: 'Швидкість',
		armorLabel: 'Броня',
		jumpTrait: 'Стрибок через перешкоди',
		spawnsOnDeathTrait: 'Розпадається при смерті',
		periodicSpawnTrait: 'Породжує зграю в польоті',
		shieldAuraTrait: 'Аура щита союзникам',
		basicUnitTrait: '— Базовий штурмовик —',

		hudLives: 'Життя',
		hudScrap: 'Ресурси',
		hudWave: 'Хвиля',
		earlyWaveBtn: 'Дострокова хвиля',
		tacticalPause: 'Пауза огляду',
		editorTooltip: 'Клік: додати точку шляху, Shift+Клік: додати слот вежі',
		editorOn: 'Редактор ON',
		menuBtn: 'Меню',
		pauseOverlayNotice:
			'Пауза для огляду поля: за правилами концепту будівництво, накази героям та здібності під час паузи недоступні.',
		canvasAriaLabel:
			'Ігрове поле космічної колонії: захисні вежі, сітка секторів та шлях прибульців',
		victoryTitle: 'МАЙСТЕРНЮ ВРЯТОВАНО!',
		victoryStars: 'Зірок здобуто',
		remainingLives: 'Залишок життів',
		defeatTitle: 'ОБОРОНУ ПРОРВАНО',
		defeatSubtitle: 'Фауна захопила майстерню. Спробуйте іншу комбінацію веж!',
		toMenuBtn: 'У меню',
		selectTowerBuildSlot: 'Оберіть установку для зведення на слоті',
		upgradeTowerTo: 'Покращити до',
		demolishTower: 'Демонтаж',
		slotInstructionHint:
			'Клікніть на круглий будівельний слот (+), щоб звести вежу, або оберіть героя для переміщення по полю.',
		copyMapJsonBtn: 'Копіювати JSON мапи'
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
		btnChangeLoadout: '← Change Loadout',
		btnBackToMenu: '← Back to Menu',
		btnPrepareMission: 'Prepare for Mission 01: Workshop →',
		manualBtn: 'Manual',
		manualFullBtn: 'Equipment & Fauna Guide (47 Arts)',
		menuBadge: 'Sci-Fi Tower Defense • Full Graphics',
		menuTitle: 'THE LAST SHIP OF THE COLONY',
		menuSubtitle: 'Civilian specialists turn industrial equipment into defensive weaponry',
		campaignOverview: 'Campaign: 4 Districts / 20 Missions',
		availableDistrict: 'Available: District 1 (Mission 01)',
		district1Name: '1. Industrial Outskirts',
		district1Desc: 'Hold the workshop and gather surviving workers.',
		district2Name: '2. Residential Sector',
		district2Desc: 'Evacuate the hospital and rescue key personnel.',
		district3Name: '3. Mining & Refinery',
		district3Desc: 'Collect essential components and fuel for the mothership.',
		district4Name: '4. Spaceport',
		district4Desc: 'Power up mothership systems for final evacuation.',
		missionsLabel: 'MISSIONS',
		loadoutTitle: 'Mission Squad Loadout',
		loadoutSubtitle: 'Select towers (1–5) and specialists (1–2)',
		presetsLabel: 'Presets:',
		presetRandom: 'Random',
		presetBalance: 'Balanced',
		presetHeavy: 'Heavy',
		presetControl: 'Control',
		presetClear: 'Clear',
		towerInspectorTitle: 'Tower Inspector',
		inspectHint: 'Click any card to inspect its stats & upgrades',
		addToSquad: 'Add to Squad',
		removeFromSquad: 'Remove from Squad',
		freeSlot: 'Open Slot',
		squadFullTower: '5/5 Limit',
		squadFullHero: '2/2 Limit',
		readyToDeploy: 'Squad assembled and ready for deployment',
		needMoreUnits: 'Select at least 1 tower and 1 specialist',
		specialistsSquad: 'Squad Specialists:',
		towersSquad: 'Squad Towers:',
		towersCountLabel: 'Towers',
		specialistsCountLabel: 'Specialists',

		presetRandomTooltip: 'Generate 5 random towers and 2 random specialists',
		presetBalanceTooltip: 'Balanced loadout: stall, laser, piercing and construction',
		presetHeavyTooltip: 'Heavy loadout: armor-piercing tools, heavy cranes and assault exosuits',
		presetControlTooltip: 'Control loadout: seismic slow, minefields and clearing',
		presetClearTooltip: 'Clear all selections (0 towers, 0 specialists)',
		secondsSuffix: 's',
		selectMinTowerWarning: 'Select at least 1 engineering tower for defense.',
		selectMinHeroWarning: 'Select at least 1 specialist (hero).',
		challengeSquadNotice:
			'Challenge squad ({towers}/5 towers, {heroes}/2 specialists). The battle will be tougher!',

		closeModal: 'Close',
		speedLabel: 'Speed',
		armorLabel: 'Armor',
		jumpTrait: 'Jumps over obstacles',
		spawnsOnDeathTrait: 'Spawns units on death',
		periodicSpawnTrait: 'Spawns swarm periodically',
		shieldAuraTrait: 'Shield aura to allies',
		basicUnitTrait: '— Basic Attacker —',

		hudLives: 'Lives',
		hudScrap: 'Scrap',
		hudWave: 'Wave',
		earlyWaveBtn: 'Early Wave',
		tacticalPause: 'Tactical Pause',
		editorTooltip: 'Click: add waypoint, Shift+Click: add tower slot',
		editorOn: 'Editor ON',
		menuBtn: 'Menu',
		pauseOverlayNotice:
			'Tactical pause: building, hero orders, and active abilities are disabled during pause by design.',
		canvasAriaLabel: 'Space colony battlefield: defensive towers, sector grid, and alien path',
		victoryTitle: 'WORKSHOP SAVED!',
		victoryStars: 'Stars earned',
		remainingLives: 'Remaining lives',
		defeatTitle: 'DEFENSE BREACHED',
		defeatSubtitle: 'Hostile fauna overran the workshop. Try a different tower combination!',
		toMenuBtn: 'To Menu',
		selectTowerBuildSlot: 'Select tower to construct on slot',
		upgradeTowerTo: 'Upgrade to',
		demolishTower: 'Demolish',
		slotInstructionHint:
			'Click on a build slot (+) to construct a tower, or select a hero to move across the field.',
		copyMapJsonBtn: 'Copy Map JSON'
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
