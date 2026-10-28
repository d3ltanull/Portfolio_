# Портфолио — Андрей Денисенко

Авторский сайт UI/UX и веб-дизайнера. Статическая многостраничная сборка на Vite, контактная форма уходит в Telegram через Vercel Function.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес, который покажет Vite (обычно `http://localhost:5173`).

## Сборка

```bash
npm run build
npm run preview
```

Готовые файлы окажутся в `dist/`.

## Деплой

Проект рассчитан на Vercel:

- `npm run build`, выход — `dist`
- API: `api/send-message.js`

Для формы задайте переменные окружения:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Структура

- `index.html` — главная: индекс работ, избранное, контакт
- `about.html` — профиль и опыт
- `project-1.html` … `project-8.html` — кейсы
- `css/main.css` — токены, сетка, компоненты, motion
- `js/main.js` — навигация, появление, превью, лайтбокс, форма
- `public/img/` — оригинальные изображения проектов
- `api/send-message.js` — отправка сообщений в Telegram
