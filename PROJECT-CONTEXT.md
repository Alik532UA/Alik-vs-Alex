# Alik vs Sahko — Project Context

## 1. Загальні відомості

- **Назва**: Alik vs Sahko (Space Colony Tower Defense)
- **Опис**: Тактична науково-фантастична 2D-стратегія Tower Defense: захист майстерні колонії від хвиль інопланетних загарбників за допомогою переобладнаного промислового устаткування, бойових інженерів та роботизованих ліній.
- **Стек**: SvelteKit 3 (`@sveltejs/kit`), Svelte 5 (Runes), TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), HTML5 Canvas 2D, `@sveltejs/adapter-static`.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/Alik-vs-Alex/`).
- **Гілка деплою**: `master` (або `main`).

---

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)

- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/Alik-vs-Alex` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує коректні абсолютні шляхи при SSR/prerender)
- **paths.origin**: `https://alik532ua.github.io`

---

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле                      | Значення          |
| ------------------------- | ----------------- |
| **PROJECT_PREFIX**        | `alikvsalex_`     |
| **STORAGE_PREFIX (prod)** | `alikvsalex_`     |
| **STORAGE_PREFIX (dev)**  | `alikvsalex-dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі     | Призначення                            | Дозволені значення    |
| ------------------- | ------------------------- | -------------------------------------- | --------------------- |
| `high_score`        | `alikvsalex_high_score`   | Рекорд проходження хвиль               | Ціле число            |
| `settings_volume`   | `alikvsalex_volume`       | Налаштування гучності                  | Число 0.0 - 1.0       |
| `loadout_towers`    | `alikvsalex_towers`       | Збережений набір веж                   | JSON масив TowerId    |
| `loadout_heroes`    | `alikvsalex_heroes`       | Збережений набір героїв                | JSON масив HeroId     |
| `stale_reload`      | `alikvsalex_stale_reload` | Захист від циклічного перезавантаження | URL поточної сторінки |

- Прямий доступ до `localStorage` поза фасадом `$lib/services/storage.ts` заборонено (STORAGE-NAMESPACE § 4).
- Метод `storage.clear()` очищує виключно власні ключі за префіксом (STORAGE-NAMESPACE § 3).

---

## 4. Ігрові системи, баланс та архітектура модулів

1. **Ігровий рушій (`src/lib/game/engine.ts`)**:
   - `TDGameEngine`: чистий клас симуляції тактичної гри з незалежним часовим кроком `update(dt)`.
   - Система маршрутизації ворогів (Waypoints, розрахунок кута та поворот спрайтів).
   - Менеджер снарядів, мін та анімацій лазерів.
   - Механіки бафів, сповільнення, оглушення, зняття броні (armor shred).
   - Захист від падіння FPS: `dt` обмежений порогом 0.1s для запобігання квантовим прольотам через колізії.

2. **Конфігурації балансу (`src/lib/game/configs.ts`)**:
   - **8 типів веж** (кожна має 4 рівні апгрейду):
     - `drill` (Шнековий перфоратор)
     - `pile_driver` (Пальовий копер — оглушення та сейсміка)
     - `mining_laser` (Шахтний різак — безперервний промінь)
     - `fastener` (Монтажник балок — сповільнення)
     - `exosuit` (Ангар екзоскелетів — мобільні юніти)
     - `robot_line` (Конвеєр дронів — механізований взвод)
     - `crane` (Вантажний кран — масивне ураження по площі)
     - `mine_layer` (Міноукладач — захисні поля)
   - **10 типів ворогів**:
     - `runner` (Бігун), `broodmother` (Матриця), `armored_beetle` (Броненосець), `glider` (Планер), `spitter` (Плювач), `jumper` (Стрибун), `spore_carrier` (Спороносець), `pack_hound` (Гончак), `heavy_rhino` (Носоріг), `shield_bearer` (Щитоносець).
   - **5 спеціалізованих героїв**:
     - `fastener_hero`, `flamer_hero`, `exosuit_hero`, `chemist_hero`, `laser_hero`.

3. **Адаптивна генерація хвиль (`src/lib/game/waves.ts`)**:
   - Алгоритм масштабування складності: динамічний розрахунок пулу ворогів, часу спавну та нагород за хвилю.

4. **Реактивний стан (`src/lib/game/state.svelte.ts`)**:
   - `GameController`: єдине джерело правди для UI та стану екранів (`menu`, `loadout`, `briefing`, `playing`).
   - Керування швидкістю гри (1x / 2x) та паузою огляду.

5. **Мапи та рівні (`src/lib/game/maps.ts`)**:
   - Реєстр тактичних мап (`workshop_alpha`, `reactor_core`), розміри сітки, вейпоінти та динамічна перевірка доступності будівництва (`isCellBuildable`).

6. **Аудіо-рушій (`src/lib/game/audio.ts`)**:
   - `GameAudioManager`: поліфонічний процедурний синтез звукових ефектів (постріли лазерів, вибухи, алерти хвиль) на базі Web Audio API з повним контролем гучності та mute.

7. **Багатомовність (`src/lib/i18n/game.ts`)**:
   - Двомовна локалізація (UA / EN) із паритетом ключів для веж, ворогів, інтерфейсу та голосових оголошень.

8. **Архітектурні рішення (ADR)**:
   - [ADR 0001: Headless Simulation Engine, Maps Decoupling, and Keyboard Grid Accessibility](docs/adr/0001-pure-simulation-engine-and-a11y.md).
   - [ADR 0002: Procedural Web Audio Synthesis and Adaptive Loop Architecture](docs/adr/0002-procedural-web-audio-and-adaptive-loop.md).

---

## 5. Безпека та CSP (SECURITY-v10 & CSP-v10)

- **Режим CSP**: `mode: 'hash'` у `vite.config.ts`.
- **Інлайн-скрипти**: Всі інлайн-скрипти автоматично хешуються функцією `getInlineScriptHashes()` із нормальною CRLF->LF конвертацією для гарантованої крос-платформної ідентичності.
- **Відсутність unsafe-inline у script-src**: Усі скрипти або збираються з власних модулів (`'self'`), або входять до дозволеного списку sha256-хешів.
- **Тестування безпеки**:
  - `src/csp-hash.test.ts`: верифікація цілісності інлайн-скриптів.
  - `src/security.test.ts`: автоматична заборона сирого {@html} та захист ізоляції Web Storage.

---

## 6. Надійність та Error Boundaries (ERROR-HANDLING-v10 § 2.2)

- **Клієнтський обробник (`src/hooks.client.ts`)**:
  - Перехоплює та логує неперехоплені помилки в кільцевий буфер `logService.svelte.ts`.
  - Відновлює сторінку при застарілих чанках нової збірки (`chunkMissing` + `reloadOnce`).
- **Межа помилок Svelte 5 (`<svelte:boundary>`)**:
  - Інтерфейс у `src/routes/+layout.svelte` захищено компонентом `ErrorFallback.svelte`.

---

## 7. Модель версіонування (VERSIONING-v10 § 1 & § 2)

- **Модель бампа**: «бамп на коміт» `scripts/bump-version.mjs` (піднімає patch-версію `+0.0.1` на чистому Node ESM без дочірніх процесів `npm`).
- **Синхронізація**: синхронізує `package.json`, `package-lock.json`, `static/app-version.json` та `src/lib/config/version.ts`.
- **Хуки**: `.husky/pre-commit` автоматично викликає тести, перевірку типів та бамп перед створенням коміту.

---

## 8. Політика перевірок, тестування та гейтів якості

- `npm run check`: перевірка типів TypeScript та синтаксису Svelte 5 Runes через `svelte-check`.
- `npm run lint`: повний лінтинг форматування (Prettier) та коду (ESLint Flat Config).
- `npm run test:unit`: набір юніт-тестів Vitest (9 файлів, рушій, хвилі, карти, аудіо, сховище, безпека, CSP).
- `npm run check:build`: автоматичний гейт якості зібраного сайту (`build/index.html`, `build/sitemap.xml`).
- `npm run audit:ci`: строгий автоматичний аудит безпеки npm-пакетів.
- Всі перевірки вбудовані у CI/CD workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## 9. Доступність (a11y) та керування

- **Зменшення руху (`prefers-reduced-motion`)**: При активації системного режиму інтенсивні візуальні струси екрана та спалахи вибухів автоматично деактивуються.
- **Доступність для скрінрідерів (`src/lib/game/a11y.ts`)**:
  - `GameAccessibilityManager`: ARIA live region (`aria-live="polite"`) оголошує запуск хвиль, баланс ресурсів та розміщення веж.
  - Повноцінна клавіатурна сітка навігації стрілками та WASD для позиціонування без миші.
- **Гарячі клавіші (Hotkeys)**:
  - `Space` — Пауза / Продовження гри.
  - `1`, `2` — Перемикання швидкості гри (1x / 2x).
  - `Arrow keys` / `WASD` — Навігація курсором сітки.
  - `Enter` — Зведення обраної вежі на поточній клітинці.
  - `Esc` — Скасування виділеного слоту або режиму будівництва.
