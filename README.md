# Новая общага — лабораторные №3 и №4

React + React Router + Context API + RxJS; Spring Boot + Spring Security + jOOQ; PostgreSQL.

## Быстрый запуск на Windows

Откройте Docker Desktop и дождитесь готовности сервера контейнеров.

```powershell
cd 'D:\ВЕБ\web-prog'
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/init-env.ps1
docker compose up --build -d
docker compose logs -f backend
```

Первая команда подготовки создаёт `.env` со случайными паролями и JWT-секретом. Существующий `.env` она не меняет. Когда backend запущен, откройте http://localhost:8080. Логин администратора — `admin`, пароль находится в строке `BOOTSTRAP_ADMIN_PASSWORD` локального `.env`. Не публикуйте этот файл. Для обычного пользователя используйте регистрацию.

Compose использует имя проекта `webprog-lab4` и отдельный volume. Старая база проекта `web-prog` не удаляется и автоматически не переносится в новый проект. Это позволяет проверять новую лабораторную без изменения старых данных.

Swagger: http://localhost:8000/swagger-ui/index.html. Порты можно изменить в `.env`: `FRONTEND_PORT`, `BACKEND_PORT`.

Необязательно, после готовности backend: `node scripts/seed-demo.mjs` добавит шесть учебных студентов для демонстрации поиска и пагинации. Существующие записи не изменяются, занятые ИСУ пропускаются. Скрипт использует администратора из локального `.env`.

Остановить (данные сохраняются):

```powershell
docker compose down
```

`docker compose down -v` удаляет базу; для обычной остановки эту команду не используйте.

Если хотите настроить конфигурацию вручную, скопируйте `.env.example` в `.env`, заполните пароль базы и JWT_SECRET (Base64 минимум 32 случайных байт). BOOTSTRAP_ADMIN_* необязательны: они создают только новый аккаунт, существующему аккаунту права автоматически не повышают. Смена роли в базе действует со следующего запроса.

При повторном использовании существующего PostgreSQL volume пароль DB_PASSWORD должен соответствовать паролю уже созданной БД. Изменение `.env` не меняет пароль существующей БД.

## Разработка frontend

Backend и PostgreSQL можно оставить запущенными в Docker. Для frontend нужны Node.js 24 LTS и npm:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Открыть http://127.0.0.1:5173. Адрес 127.0.0.1 уже закреплён в Vite. `/api` проксируется на http://127.0.0.1:8000; другой адрес задаётся через `frontend/.env` по примеру `frontend/.env.example`. Эти настройки относятся к серверу разработки. В Docker запросы проксирует Nginx.

## Реализованные возможности

- `/login`, `/register`, `/profile`; восстановление сессии и выход.
- Access/refresh JWT, один общий refresh при нескольких 401, повтор исходного запроса максимум один раз.
- USER: список и подробности; ADMIN: создание, полная правка и удаление с подтверждением.
- Поиск, отдельные фильтры всех полей, сортировка по всем полям в обоих направлениях, серверная пагинация.
- RxJS: BehaviorSubject, Observable, distinctUntilChanged, switchMap, timer, catchError, shareReplay; отписка вызывает AbortController.abort(). Пауза 300 мс для ввода, немедленная отмена старого запроса.
- Валидация форм, сообщения API, загрузка и блокировка повторных отправок.
- Адаптивный интерфейс, прямое открытие вложенных маршрутов через Nginx.
- Многоэтапные Dockerfile, общий Compose, PostgreSQL volume и healthcheck.

## Проверки

```powershell
cd frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Backend (JDK 21 или новее):

```powershell
cd backend
.\mvnw.cmd -B -ntp test
```

Автотесты frontend проверяют отмену/порядок запросов, продолжение потока после ошибок, общий refresh, отсутствие восстановления сессии после logout, 403/204 и валидацию. Backend-тесты проверяют JWT и актуальность роли/аккаунта в фильтре. Они не заменяют проверку с настоящей БД.

## Архитектура

```text
frontend/src/
  api/           HTTP, токены, auth API и students API
  auth/          Context пользователя и защита маршрутов
  components/    общая оболочка, таблица, фильтры, пагинация, состояния
  pages/         вход/регистрация, профиль, список, карточка, форма
  reactive/      переиспользуемый поток запросов списка
  hooks/         подписка React на поток и её очистка
  utils/         валидация
```

Подробный разбор: [docs/LAB4_GUIDE.md](docs/LAB4_GUIDE.md). Проверка перед защитой: [docs/DEFENSE_CHECKLIST.md](docs/DEFENSE_CHECKLIST.md).

Ответы на 20 вопросов: [docs/DEFENSE_ANSWERS.md](docs/DEFENSE_ANSWERS.md). Результаты выполненных проверок: [docs/VERIFICATION.md](docs/VERIFICATION.md).

Старые HTML, корневые `js/`, `css/`, корневые Dockerfile и nginx.conf оставлены как история лабы №3. Новый Compose использует только `frontend/Dockerfile` и `frontend/nginx.conf`. Учебный компонент до перехода на API сохранён в `docs/learning/StudentsPage.before-api.jsx.txt`.

## Ограничения безопасности учебного проекта

Токены находятся в sessionStorage текущей вкладки; это не HttpOnly-cookie и не защита от XSS. Пароли не сохраняются. React экранирует обычный текст; dangerouslySetInnerHTML не используется. JWT-секрет находится только на backend. Cookie-аутентификации нет, запросы используют Bearer, CSRF в этой конфигурации отключён.

Logout очищает токены в браузере, но не отзывает скопированный токен на сервере. Серверная ротация/отзыв refresh-сессий в эту работу не добавлены: refresh действует до своего exp, если аккаунт существует и совпадает ID. Для полноценного отзыва нужна отдельная таблица сессий.
