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
		const nextLevelIndex = tower.level as 1 | 2 | 3;
		const nextStats = TOWERS[tower.type].levels[nextLevelIndex];
		if (!nextStats || game.currency < nextStats.cost) return;

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
				text: `+${waveCfg.earlyCallBonus} Достроково!`
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
					x: hero.x,
					y: hero.y,
					targetX: target.x,
					targetY: target.y,
					color: '#ef4444',
					ttl: 0.4,
					maxTtl: 0.4,
					kind: 'beam'
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
			const t =
				lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lenSq));
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
					if (
						other.uid !== e.uid &&
						Math.hypot(other.x - e.x, other.y - e.y) <= cfg.shieldAuraRadius
					) {
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
					this.spawnEnemy(
						cfg.periodicSpawn.id,
						{ x: e.x, y: e.y },
						e.waypointIndex,
						e.distanceTraveled
					);
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
						x: e.x,
						y: e.y - 12,
						color: '#eab308',
						ttl: 0.5,
						maxTtl: 0.5,
						kind: 'text',
						text: 'СТРИБОК!'
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
				const unitTarget = this.units.find(
					(u) => Math.hypot(u.x - e.x, u.y - e.y) <= cfg.rangedRange!
				);
				if (unitTarget && e.attackTimer <= 0) {
					e.attackTimer = 1.4;
					unitTarget.hp -= cfg.rangedDamage;
					this.effects.push({
						x: e.x,
						y: e.y,
						targetX: unitTarget.x,
						targetY: unitTarget.y,
						color: '#84cc16',
						ttl: 0.15,
						maxTtl: 0.15,
						kind: 'beam'
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
						x: tower.x,
						y: tower.y,
						radius: stats.range,
						color: cfg.color,
						ttl: 0.3,
						maxTtl: 0.3,
						kind: 'circle'
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
						x: primary.x,
						y: primary.y,
						radius: stats.aoeRadius ?? 70,
						color: cfg.color,
						ttl: 0.35,
						maxTtl: 0.35,
						kind: 'circle'
					});
				} else {
					// Fastener or Horizontal Pile Driver
					const primary =
						tower.type === 'pile_driver'
							? [...validTargets].sort((a, b) => ENEMIES[b.type].armor - ENEMIES[a.type].armor)[0]
							: validTargets[0];
					this.dealDamage(primary, stats.damage, stats.armorPierce ?? 0);
					this.effects.push({
						x: tower.x,
						y: tower.y,
						targetX: primary.x,
						targetY: primary.y,
						color: cfg.color,
						ttl: 0.14,
						maxTtl: 0.14,
						kind: 'beam'
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
					if (
						ENEMIES[e.type].domain === 'ground' &&
						Math.hypot(e.x - m.x, e.y - m.y) <= m.aoeRadius
					) {
						this.dealDamage(e, m.damage, 0.3);
					}
				}
				this.effects.push({
					x: m.x,
					y: m.y,
					radius: m.aoeRadius,
					color: '#a855f7',
					ttl: 0.35,
					maxTtl: 0.35,
					kind: 'circle'
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
						x: h.x,
						y: h.y,
						targetX: target.x,
						targetY: target.y,
						color: cfg.color,
						ttl: 0.12,
						maxTtl: 0.12,
						kind: 'beam'
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
