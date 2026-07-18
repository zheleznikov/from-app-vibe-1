# Мини-анкета (Mini Survey)

Учебное full-stack приложение: React + TypeScript фронтенд отображает анкету, полученную с backend на Node.js + TypeScript (Express), пользователь заполняет и отправляет ответы, которые сохраняются в оперативной памяти сервера.

> **Для преподавателя:** самый быстрый способ проверить проект — раздел [«Быстрый старт для проверки»](#быстрый-старт-для-проверки-preподавателем) ниже. Требуется только установленный Docker Desktop.

## Содержание

1. [Описание приложения](#описание-приложения)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Быстрый старт для проверки (преподавателем)](#быстрый-старт-для-проверки-преподавателем)
5. [Запуск через Docker Compose](#запуск-через-docker-compose)
6. [Адреса приложения](#адреса-приложения)
7. [Примеры API-запросов](#примеры-api-запросов)
8. [Остановка приложения](#остановка-приложения)
9. [Запуск без Docker (локальная разработка)](#запуск-без-docker-локальная-разработка)
10. [Хранение данных](#хранение-данных)
11. [Проверка приложения](#проверка-приложения)
12. [Известные ограничения](#известные-ограничения)

## Описание приложения

Пользователь открывает страницу с анкетой → frontend запрашивает список вопросов у backend (`GET /questions`) → пользователь заполняет форму → ответы отправляются на backend (`POST /answers`) → при успехе пользователь видит сообщение **«Спасибо!»**.

Данные анкеты хранятся **только в оперативной памяти** backend-процесса. База данных не используется — после перезапуска backend все ранее сохранённые ответы теряются. Это ожидаемое поведение, а не баг.

## Технологический стек

**Frontend**
- React 18 + TypeScript
- Vite (сборка и dev-сервер)
- Fetch API для HTTP-запросов
- Обычный CSS (без UI-библиотек, без Redux)

**Backend**
- Node.js + TypeScript
- Express
- CORS
- In-memory хранилище (массив `Submission[]`), без базы данных

**Инфраструктура**
- Docker + Docker Compose (два сервиса: `frontend`, `backend`)
- Nginx — раздаёт собранный frontend в проде

## Структура проекта

```text
form-app-vibe/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── questions.ts       # список вопросов анкеты
│   │   │   └── submissions.ts     # in-memory хранилище ответов
│   │   ├── routes/
│   │   │   ├── questions.ts       # GET /questions
│   │   │   └── answers.ts         # POST /answers, GET /answers
│   │   ├── types/
│   │   │   └── survey.ts          # общие типы backend
│   │   ├── validation/
│   │   │   └── validateAnswers.ts # валидация входящих ответов
│   │   ├── app.ts                 # конфигурация Express-приложения
│   │   └── server.ts              # запуск HTTP-сервера
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── surveyApi.ts       # обёртка над fetch (VITE_API_URL)
│   │   ├── components/
│   │   │   └── SurveyForm.tsx     # форма анкеты со всеми состояниями
│   │   ├── types/
│   │   │   └── survey.ts          # общие типы frontend
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── nginx/
│   │   └── nginx.conf             # конфигурация Nginx для прод-контейнера
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Быстрый старт для проверки (преподавателем)

Единственное требование — установленный **Docker Desktop** (или Docker Engine + Compose plugin).

```bash
git clone https://github.com/zheleznikov/from-app-vibe-1.git
cd from-app-vibe-1
docker compose up --build
```

Дождитесь строк вида `Container mini-survey-frontend  Started` в консоли, затем откройте в браузере:

```text
http://localhost:3000
```

Проверка работоспособности:

1. Страница должна показать заголовок «Мини-анкета» и форму с 4 вопросами.
2. Попробуйте нажать «Отправить», не заполнив обязательные поля — появится сообщение об ошибке под соответствующим полем.
3. Заполните обязательные поля («Как вас зовут?», «Сколько лет вы занимаетесь разработкой?») и нажмите «Отправить» — должно появиться сообщение **«Спасибо!»**.
4. Backend API можно проверить напрямую — см. раздел [«Примеры API-запросов»](#примеры-api-запросов).

Остановить приложение можно комбинацией `Ctrl+C` в терминале, либо командой `docker compose down` (см. [«Остановка приложения»](#остановка-приложения)).

## Запуск через Docker Compose

Из корня репозитория:

```bash
docker compose up --build
```

Что при этом происходит:

- собирается образ **backend** (компиляция TypeScript → `dist/`, запуск `node dist/server.js`, сервер слушает `0.0.0.0:4000`);
- собирается образ **frontend** (сборка React-приложения через Vite, затем статические файлы раздаются через Nginx на порту `3000`);
- оба контейнера подключаются к общей Docker-сети `mini-survey-network`;
- у backend настроен healthcheck (`GET /health`), frontend запускается только после того, как backend перейдёт в состояние `healthy`;
- порт backend публикуется на хосте как `4000`, порт frontend — как `3000`.

Чтобы запустить в фоне (не блокируя терминал):

```bash
docker compose up --build -d
```

## Адреса приложения

| Сервис   | Адрес                     |
|----------|----------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:4000     |
| Health   | http://localhost:4000/health |

## Примеры API-запросов

### Проверка работоспособности backend

```bash
curl http://localhost:4000/health
```

PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:4000/health
```

### Получить список вопросов

```bash
curl http://localhost:4000/questions
```

PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:4000/questions
```

### Отправить ответы (успешный случай)

```bash
curl -X POST http://localhost:4000/answers \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "name": "Иван",
      "experience": 3,
      "feedback": "Хочу изучить full-stack разработку"
    }
  }'
```

PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:4000/answers `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    answers = @{
      name = "Иван"
      experience = 3
      feedback = "Хочу изучить full-stack разработку"
    }
  } | ConvertTo-Json)
```

Ожидаемый ответ (HTTP 201):

```json
{
  "success": true,
  "message": "Ответы сохранены",
  "submissionId": "generated-id"
}
```

### Отправить ответы без обязательного поля (ошибка валидации)

```bash
curl -i -X POST http://localhost:4000/answers \
  -H "Content-Type: application/json" \
  -d '{"answers": {"experience": 3}}'
```

Ожидаемый ответ (HTTP 400):

```json
{
  "success": false,
  "message": "Не заполнен обязательный вопрос: Как вас зовут?"
}
```

### Посмотреть все сохранённые ответы (только для локальной проверки)

```bash
curl http://localhost:4000/answers
```

PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:4000/answers
```

## Остановка приложения

Если контейнеры запущены в интерактивном режиме (`docker compose up --build`) — нажмите `Ctrl+C` в этом же терминале.

Чтобы остановить и удалить контейнеры и сеть:

```bash
docker compose down
```

Образы при этом остаются в кэше Docker и пересобирать их заново при следующем запуске не нужно (если код не менялся).

## Запуск без Docker (локальная разработка)

Требуется установленный Node.js (версия 18+).

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend поднимется на `http://localhost:4000` с автоперезапуском при изменении файлов (`ts-node-dev`).

Для прод-сборки без Docker:

```bash
npm run build
npm start
```

### Frontend

В отдельном терминале:

```bash
cd frontend
npm install
```

Создайте файл `.env` (рядом с `.env.example`) со значением:

```env
VITE_API_URL=http://localhost:4000
```

Затем запустите dev-сервер:

```bash
npm run dev
```

Frontend будет доступен на `http://localhost:3000` (порт задан в `vite.config.ts`).

Для прод-сборки без Docker:

```bash
npm run build
npm run preview
```

## Хранение данных

Ответы пользователей хранятся **только в оперативной памяти backend-процесса**, в обычном TypeScript-массиве (`backend/src/data/submissions.ts`). База данных (PostgreSQL, MongoDB, Redis и т.д.) не используется и не требуется.

Это означает:

- при перезапуске backend-процесса или Docker-контейнера все ранее сохранённые ответы **удаляются** — это ожидаемое поведение;
- список вопросов анкеты задан статически в коде (`backend/src/data/questions.ts`) и не меняется во время работы приложения.

## Проверка приложения

Команды для ручной проверки после запуска (`docker compose up --build` или локального запуска):

```bash
# 1. Backend доступен
curl http://localhost:4000/health

# 2. Вопросы анкеты возвращаются
curl http://localhost:4000/questions

# 3. Корректные ответы принимаются и сохраняются
curl -X POST http://localhost:4000/answers \
  -H "Content-Type: application/json" \
  -d '{"answers": {"name": "Иван", "experience": 3, "feedback": "Хочу изучить full-stack разработку"}}'

# 4. Ответ без обязательного поля отклоняется с HTTP 400
curl -i -X POST http://localhost:4000/answers \
  -H "Content-Type: application/json" \
  -d '{"answers": {"experience": 3}}'

# 5. Сохранённые ответы видны через служебный endpoint
curl http://localhost:4000/answers

# 6. Frontend отдаёт страницу
curl -I http://localhost:3000
```

Что проверено при разработке этого проекта:

- `npm run typecheck` и `npm run build` проходят без ошибок в `backend/` и `frontend/`;
- `docker compose up --build` успешно поднимает оба контейнера, healthcheck backend переходит в `healthy`;
- все команды выше выполнены вручную и дают ожидаемый результат (в т.ч. корректная сохранность кириллицы в ответах);
- в браузере проверены сценарии: загрузка формы, ошибка при пустом обязательном поле, успешная отправка с сообщением «Спасибо!», блокировка кнопки во время отправки.

## Известные ограничения

- Данные не сохраняются между перезапусками backend (по требованиям задания — это осознанное решение, а не недостаток).
- Отсутствует авторизация и защита от повторной отправки одной и той же анкеты одним и тем же пользователем — каждая успешная отправка создаёт новую запись.
- Нет персистентного хранилища и миграций — проект рассчитан на учебные и демонстрационные цели, а не на промышленную эксплуатацию.
- `VITE_API_URL` «зашивается» в статическую сборку frontend на этапе `docker build` (Vite не поддерживает runtime-переменные окружения для статических файлов). Если backend будет доступен по другому адресу, нужно пересобрать frontend-образ с новым значением `VITE_API_URL` (см. `frontend/Dockerfile`, `ARG VITE_API_URL`).
