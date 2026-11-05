# Лабораторная №3

Spring Boot, jOOQ, PostgreSQL, BCrypt, JWT access/refresh, роли ADMIN и USER.

## Запуск

1. Скопируйте `.env.example` в `.env` и задайте `DB_PASSWORD`.
2. Сгенерируйте JWT_SECRET в PowerShell и вставьте результат в `.env`:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

3. Запустите Docker Engine, затем `docker compose up --build` из корня проекта.

Frontend: http://localhost:8080. API: http://localhost:8000/api/requests.
Swagger: http://localhost:8000/swagger-ui.html.
Данные PostgreSQL сохраняются в Docker volume.
Корневой compose запускает весь проект; `backend/docker-compose.yml` — только отдельную БД для разработки.

## Пользователи

Зарегистрируйтесь через страницу входа. Регистрация всегда создаёт USER.
USER читает студентов, ADMIN также создаёт, изменяет и удаляет их.
Для назначения администратора выполните вручную (замените `myadmin` своим логином):

```shell
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d dormitory'
```

```sql
UPDATE app_users SET role = 'ADMIN' WHERE username = 'myadmin';
```

После назначения роли войдите заново, чтобы получить новый access-токен.
Frontend хранит токены в sessionStorage, обновляет access при 401 и возвращает на вход при истечении refresh.
Права проверяются Spring Security на сервере. Выход удаляет токены из вкладки; уже выданные JWT действуют до истечения срока.

## Проверка API

Импортируйте `postman/lab3.postman_collection.json`. Выполняйте запросы по порядку.
Коллекция регистрирует USER, проверяет вход и refresh, чтение и запрет записи (403).
Для ADMIN зарегистрируйте отдельный аккаунт, назначьте роль SQL-командой выше и заполните переменные `adminUsername`, `adminPassword` коллекции.
Далее коллекция проверяет POST, GET, PUT, PATCH, поиск/фильтры/сортировку/пагинацию и DELETE, а также ошибки 400, 401, 404 и 409.

Для локальной разработки backend нужны JDK 21 и PostgreSQL. Перед запуском задайте DB_URL, DB_USERNAME, DB_PASSWORD и JWT_SECRET как переменные окружения; `.env` автоматически читает Docker Compose, не Spring Boot.
Тесты: `cd backend` и `./mvnw test` (Windows: `mvnw.cmd test`).
