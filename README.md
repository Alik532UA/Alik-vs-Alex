# Останній Корабель Колонії (Tower Defense)

Космічна 2D Tower Defense стратегія на Svelte 5 / SvelteKit / Tailwind CSS з концепт-артами промислових веж, героїв та мутантів фауни.

## Графіка та спрайти (47 зображень)

Всі заглушки замінено на повноцінні концепт-арти:
- **Інженерні вежі (8 типів × 4 рівні = 32 арти)**: `static/assets/sprites/towers/`
  - Бурова установка (`drill_1` .. `drill_4`)
  - Горизонтальний сваєбій (`pile_driver_1` .. `pile_driver_4`)
  - Гірничодобувний лазер (`mining_laser_1` .. `mining_laser_4`)
  - Кріпильний метальник (`fastener_1` .. `fastener_4`)
  - Платформа екзокостюмів (`exosuit_1` .. `exosuit_4`)
  - Складальна лінія роботів (`robot_line_1` .. `robot_line_4`)
  - Будівельний кран (`crane_1` .. `crane_4`)
  - Укладальник мін (`mine_layer_1` .. `mine_layer_4`)
- **Вороги колонії (10 видів)**: `static/assets/sprites/enemies/`
  - Бігун (`runner`), Виводковик (`broodmother`), Панцирник (`armored_beetle`), Планер (`glider`), Плювальник (`spitter`), Стрибун (`jumper`), Спороносець (`spore_carrier`), Стайник (`pack_hound`), Важковаговик (`heavy_rhino`), Щитоносець (`shield_bearer`)
- **Головні спеціалісти (5 героїв)**: `static/assets/sprites/heroes/`
  - Макс / Монтажник (`fastener_hero`)
  - Влад / Вогнеметник (`flamer_hero`)
  - Борг / Оператор Екзо (`exosuit_hero`)
  - Док / Хімік (`chemist_hero`)
  - Ірина / Лазерниця (`laser_hero`)
- **Союзні юніти**: роботи (`robot_unit`) та штурмові екзокостюми (`exosuit_unit`).

---

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
