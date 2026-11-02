# Alik vs Sahko — Project Context

## 1. Загальні відомості

- **Назва**: Alik vs Sahko (Space Colony Tower Defense)
- **Опис**: Тактична науково-фантастична 2D-стратегія Tower Defense: захист майстерні колонії від хвиль інопланетних загарбників за допомогою переобладнаного промислового устаткування, бойових інженерів та роботизованих ліній.
- **Стек**: SvelteKit 3 (`@sveltejs/kit`), Svelte 5 (Runes), TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), HTML5 Canvas 2D, `@sveltejs/adapter-static`.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/Alik-vs-Alex/`).
- **Гілка деплою**: `master` (або `main`).

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)

- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/Alik-vs-Alex` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує коректні абсолютні шляхи при SSR/prerender)
- **paths.origin**: `https://alik532ua.github.io`

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле                      | Значення          |
| ------------------------- | ----------------- |
| **PROJECT_PREFIX**        | `alikvsalex_`     |
| **STORAGE_PREFIX (prod)** | `alikvsalex_`     |
| **STORAGE_PREFIX (dev)**  | `alikvsalex-dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі   | Призначення              | Дозволені значення |
| ------------------- | ----------------------- | ------------------------ | ------------------ |
| `high_score`        | `alikvsalex_high_score` | Рекорд проходження хвиль | Ціле число         |
| `settings_volume`   | `alikvsalex_volume`     | Налаштування гучності    | Число 0.0 - 1.0    |
| `loadout_towers`    | `alikvsalex_towers`     | Збережений набір веж     | JSON масив TowerId |
| `loadout_heroes`    | `alikvsalex_heroes`     | Збережений набір героїв  | JSON масив HeroId  |

- Прямий доступ до `localStorage` поза фасадом `$lib/services/storage.ts` заборонено (STORAGE-NAMESPACE § 4).
- Метод `storage.clear()` очищує виключно власні ключі за префіксом (STORAGE-NAMESPACE § 3).

## 4. Ігрові системи, баланс та архітектура модулів

1. **Ігровий рушій (`src/lib/game/engine.ts`)**:
   - `TDGameEngine`: чистий клас симуляції тактичної гри з незалежним часовим кроком `update(dt)`.
   - Система маршрутизації ворогів (Waypoints, розрахунок кута та поворот спрайтів).
   - Менеджер снарядів, мін та анімацій лазерів.
   - Механіки бафів, сповільнення, оглушення, зняття броні (armor shred).
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
3. **Реактивний стан (`src/lib/game/state.svelte.ts`)**:
   - `GameController`: єдине джерело правди для UI та стану екранів (`menu`, `loadout`, `briefing`, `playing`).
   - Керування швидкістю гри (1x / 2x) та паузою огляду.

## 5. Безпека та CSP (SECURITY-v10 & CSP-v10)

- **Режим CSP**: `mode: 'hash'` у `vite.config.ts`.
- **Інлайн-скрипти**: Всі інлайн-скрипти автоматично хешуються функцією `getInlineScriptHashes()` із нормальною CRLF->LF конвертацією для гарантованої крос-платформної ідентичності.
- **Відсутність unsafe-inline у script-src**: Усі скрипти або збираються з власних модулів (`'self'`), або входять до дозволеного списку sha256-хешів.
- **Тестування безпеки**:
  - `src/csp-hash.test.ts`: верифікація цілісності інлайн-скриптів.
  - `src/security.test.ts`: автоматична заборона сирого {@html} та захист ізоляції Web Storage.

## 6. Модель версіонування (VERSIONING-v10 § 1 & § 2)

- **Модель бампа**: «бамп на коміт» `scripts/bump-version.mjs` (піднімає patch-версію `+0.0.1` на чистому Node ESM без дочірніх процесів `npm`).
- **Синхронізація**: синхронізує `package.json`, `package-lock.json`, `static/app-version.json` та `src/lib/config/version.ts`.
- **Хуки**: `.husky/pre-commit` автоматично викликає тести, перевірку типів та бамп перед створенням коміту.

## 7. Політика перевірок, тестування та гейтів якості

- `npm run check`: перевірка типів TypeScript та синтаксису Svelte 5 Runes через `svelte-check`.
- `npm run lint`: повний лінтинг форматування (Prettier) та коду (ESLint 9 Flat Config).
- `npm run test:unit`: набір юніт-тестів Vitest (`src/csp-hash.test.ts`, `src/security.test.ts`, `src/lib/services/storage.test.ts`, `src/lib/game/engine.test.ts`).
- `npm run check:build`: автоматичний гейт якості зібраного сайту (`build/index.html`, `build/sitemap.xml`).
- `npm run audit:ci`: строгий автоматичний аудит безпеки npm-пакетів.
- Всі перевірки вбудовані у CI/CD workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## 8. Доступність (a11y) та керування

- **Зменшення руху (`prefers-reduced-motion`)**: При активації системного режиму інтенсивні візуальні струси екрана та спалахи вибухів автоматично деактивуються.
- **Гарячі клавіші (Hotkeys)**:
  - `Space` — Пауза / Продовження гри.
  - `1`, `2` — Перемикання швидкості гри (1x / 2x).
  - `Esc` — Скасування виділеного слоту або режиму будівництва.
- **SEO & Маніфести**:
  - `static/robots.txt`: інструкції для пошукових ботів та шлях до карти сайту.
  - `static/llms.txt`: стандартизований маніфест опису гри для AI агентів.
  - `build/sitemap.xml`: автоматично генерується після кожної збірки.

## 9. Реєстр префіксів на спільному origin

| Проєкт           | Префікс (prod)      | Префікс (dev)           | Призначення                      |
| ---------------- | ------------------- | ----------------------- | -------------------------------- |
| Alik-vs-Alex     | `alikvsalex_`       | `alikvsalex-dev_`       | Космічна стратегія Tower Defense |
| adoptananimal    | `adoptananimal_`    | `adoptananimal-dev_`    | Притулок для тварин              |
| VetCrewEmergency | `vetcrewemergency_` | `vetcrewemergency-dev_` | Невідкладна ветеринарна допомога |
| VetCrewHospital  | `vetcrewhospital_`  | `vetcrewhospital-dev_`  | Ветеринарний госпіталь           |
| VetCrewGames     | `vetcrewgames_`     | `vetcrewgames-dev_`     | Навчальні ветеринарні ігри       |
| DeviantBlaze     | `deviantblaze_`     | `deviantblaze-dev_`     | Рок-портал та аудіовізуалізатор  |
