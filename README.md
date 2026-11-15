# Новая общага — лабораторные №3, №4 и №5

Next.js 16 (App Router) + React + Context API + RxJS; Spring Boot + Spring Security + jOOQ; PostgreSQL.

## Запуск на Windows

Открой Docker Desktop. Из корня проекта:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/init-env.ps1
docker compose up --build -d
docker compose ps
```

Сайт: http://localhost:8080. Swagger Java: http://localhost:8000/swagger-ui/index.html.
Логин администратора берётся из `BOOTSTRAP_ADMIN_USERNAME` (обычно `admin`), пароль — из `BOOTSTRAP_ADMIN_PASSWORD` локального `.env`. Обычный пользователь создаётся через регистрацию. `.env` не публикуется.

Если backend и БД уже запущены, обновить только frontend:

```powershell
docker compose up -d --no-deps --build frontend
```

Остановить с сохранением базы: `docker compose down`. Флаг `-v` удаляет volume базы.
Имя Compose-проекта намеренно осталось `webprog-lab4`, чтобы продолжить использовать существующую базу. Миграция на Next.js не требует удаления/пересоздания данных.

При смене порта frontend задай в корневом `.env` также `APP_ORIGIN`, например `FRONTEND_PORT=8090` и `APP_ORIGIN=http://localhost:8090`. Открывай сайт именно по этому origin. Для HTTPS установи `COOKIE_SECURE=true`.

## Разработка frontend

Нужны Node.js 24 LTS и npm. Backend и PostgreSQL можно оставить в Docker.

```powershell
cd frontend
Copy-Item .env.example .env.local
npm.cmd ci
npm.cmd run dev
```

Открой http://localhost:5173. Настройки `.env.local`: `BACKEND_URL=http://127.0.0.1:8000`, `APP_ORIGIN=http://localhost:5173`, `COOKIE_SECURE=false`. Это серверные переменные, в браузер они не передаются.

## Что реализовано в пятой лабораторной

- Настоящий SSR: список, карточка и данные для редактирования загружаются сервером Next.js до выдачи страницы. Профиль приходит с серверной проверкой пользователя.
- Файловая маршрутизация: `/login`, `/register`, `/students`, `/students/[id]`, `/students/new`, `/students/[id]/edit`, `/profile`.
- `src/proxy.js` защищает маршруты до рендеринга; в Next.js 16 это новое название middleware. Текущая роль проверяется через Java, а не берётся на веру из cookie.
- JWT access/refresh находятся в HttpOnly + SameSite=Lax cookie. Java выпускает и проверяет JWT; Next.js только хранит/передаёт их и обновляет через Java API.
- BFF `/api/[...path]` передаёт разрешённые запросы Java-серверу. Пароли, бизнес-правила, роли, jOOQ и БД остаются в Java.
- CSRF-защита изменяющих запросов на стороне Next.js: обязательный совпадающий Origin, блокировка cross-site запросов. JWT в Java по-прежнему передаётся как Bearer.
- Кеш данных студентов: Next fetch cache, 60 секунд, ключ включает Authorization. Перед кешем выполняется живая проверка пользователя. После успешного POST/PUT/DELETE тег `students` немедленно инвалидируется.
- Синхронизация вкладок через BroadcastChannel и обновление при возврате во вкладку. Карточка вызывает `router.refresh()`, список перезагружает RxJS-поток.
- Все прежние фильтры, поиск, сортировка, пагинация, CRUD, валидация, роли и оформление сохранены.
- Состояния загрузки в списке/формах и навигационных ссылках, error boundary, 404 и страница недостаточных прав.
- Production Docker запускает Node.js/Next.js standalone от непривилегированного пользователя вместо статического Nginx.

## Проверки

```powershell
cd frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Проверка с работающим Docker из корня проекта:

```powershell
node scripts/verify-lab5.mjs
```

Этот скрипт использует администратора из `.env`, создаёт одну временную запись студента и удаляет её. Проверяет SSR HTML, JWT refresh, CSRF, CRUD, инвалидацию кеша, ошибки, logout. Если сайт на другом адресе, задай `LAB5_URL`.

Backend при необходимости: `cd backend`, затем `.\mvnw.cmd -B -ntp test` (JDK 21+).

## Как ориентироваться

```text
frontend/src/
  app/          серверные страницы, layouts, API route handlers, error/404
  proxy.js      middleware: сессия, refresh, перенаправления, проверка роли
  server/       HTTP к Java, cookie, кеш, серверные проверки пользователя
  views/        интерактивные React-компоненты экранов (раньше pages/)
  components/   таблица, меню, фильтры, пагинация, состояния, синхронизация
  auth/         Context пользователя, полученного при SSR
  api/          браузерные запросы к Next.js BFF и сообщения между вкладками
  reactive/     RxJS-поток списка с отменой и задержкой ввода
  hooks/        подписка React на поток
  utils/        начальные фильтры и валидация
```

Разбор переноса и сценарий защиты: [docs/LAB5_GUIDE.md](docs/LAB5_GUIDE.md).
Материалы четвёртой лабы в `docs/LAB4_GUIDE.md` и прежний PDF относятся к прошлой Vite-версии: сведения о React Router, sessionStorage и Nginx в них теперь исторические.

Старые HTML и корневые `js/`, `css/`, Dockerfile, nginx.conf оставлены от лабы №3. Текущий Compose использует `frontend/Dockerfile` и Next.js.

## Границы учебной реализации

Logout удаляет cookie, но Java пока не ведёт таблицу refresh-сессий/отзыва токенов. Копия JWT остаётся действующей до срока истечения, пока аккаунт действителен. Cookie общие для вкладок одного браузерного профиля: разные пользователи одновременно требуют разных профилей/инкогнито.

Между вкладками обновления передаются в пределах одного origin. Изменения через Swagger или другой компьютер не рассылаются автоматически: кеш обновляется по времени (60 секунд, с возможной фоновой перевалидацией при чтении). Это не WebSocket/SSE.

При локальном HTTP `COOKIE_SECURE=false`; для HTTPS нужно `true`. HttpOnly закрывает чтение токенов JavaScript-кодом, но не устраняет все последствия XSS.
