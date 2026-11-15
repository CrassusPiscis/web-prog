# Разбор проекта для самостоятельного понимания

## С чего начать

Открой запущенный сайт и рядом эти файлы в порядке: main.jsx → App.jsx → auth/ProtectedRoute.jsx → pages/StudentsPage.jsx → hooks/useStudents.js → reactive/studentsStream.js → api/studentsApi.js → api/client.js. Затем повтори поиск и найди запрос во вкладке Network браузера.

## 1. Как React попадает на страницу

`frontend/index.html` содержит `<div id="root">`. `src/main.jsx` находит его через createRoot и отображает дерево. StrictMode помогает находить проблемы жизненного цикла в разработке. BrowserRouter отслеживает адрес браузера. AuthProvider делает пользователя доступным всему дереву. App описывает соответствие адресов страницам.

Переход Link меняет адрес и компонент без полной загрузки HTML. Для прямого открытия /profile Nginx возвращает index.html через try_files: нужную страницу затем выбирает React Router.

## 2. Карта файлов

| Файл | За что отвечает |
|---|---|
| main.jsx | Подключает React, маршрутизатор, Context и стили |
| App.jsx | Маршруты, вложенная оболочка и ограничения ADMIN |
| index.css | Оформление, таблицы, формы, мобильная адаптация |
| api/session.js | Чтение/запись токенов; номер поколения сессии |
| api/client.js | fetch, ошибки, Bearer, общий refresh, повтор запроса |
| api/authApi.js | login/register/me |
| api/studentsApi.js | Адреса CRUD и сборка query string |
| auth/useAuth.js | Сам Context и hook его чтения |
| auth/AuthContext.jsx | Восстановление пользователя, вход, выход, обновление профиля |
| auth/ProtectedRoute.jsx | Ожидание сессии, redirect на вход, проверка ADMIN |
| components/Layout.jsx | Шапка, навигация, текущая роль, выход, Outlet |
| components/UniverGallery.jsx | Три пользовательские фотографии и отсылки к «Универу»; prop compact включает оформление для экрана входа |
| components/Feedback.jsx | Загрузка и понятные ошибки |
| components/StudentFilters.jsx | Управляемые поля поиска, фильтров, сортировки |
| components/StudentTable.jsx | Вывод списка, ссылки и действия ADMIN |
| components/Pagination.jsx | Кнопки страниц и границы |
| pages/AuthPage.jsx | Общая форма входа/регистрации; отличаются prop registering |
| pages/ProfilePage.jsx | Публичные данные аккаунта и обновление роли |
| pages/StudentsPage.jsx | Сборка списка, фильтров, удаления и пагинации |
| pages/StudentDetailsPage.jsx | Загрузка одного студента по useParams |
| pages/StudentFormPage.jsx | Создание/правка, валидация, преобразование значений |
| reactive/studentsStream.js | Поток параметров, задержка, отмена, запросы, ошибки |
| hooks/useStudents.js | Жизнь подписки, состояние React, исправление пустой страницы |
| utils/validation.js | Чистые функции проверки форм |

## 3. Путь запроса списка

1. StudentsPage вызывает useStudents.
2. Hook один раз создаёт экземпляр потока через ленивый useState.
3. useEffect подписывается на state$; при уходе со страницы вызывает unsubscribe.
4. BehaviorSubject сразу отдаёт текущие параметры: page=0, size=10 и другие.
5. switchMap создаёт запрос актуальных параметров; текстовый ввод ждёт 300 мс.
6. studentsApi.list строит URL через URLSearchParams, не конкатенацией неэкранированного текста.
7. client добавляет Bearer accessToken.
8. В разработке запрос пересылает Vite; в Docker — Nginx.
9. Spring Security проверяет JWT и актуальную роль; StudentController принимает параметры.
10. StudentService проверяет пагинацию/сортировку. Repository строит WHERE, COUNT, SELECT ORDER BY LIMIT OFFSET.
11. PageResponse приходит в браузер. Поток отдаёт data, hook вызывает setState, таблица отображает data.items.

Ни фильтрация, ни сортировка не применяются только к текущей странице в браузере: иначе результат был бы неправильным для всей базы.

## 4. Зачем RxJS, если есть React

React отвечает за отображение состояния. RxJS отвечает за последовательность событий и асинхронных запросов. Это разные задачи.

BehaviorSubject — источник текущих параметров. Observable оборачивает HTTP и возвращает функцию очистки. distinctUntilChanged не пропускает одинаковые события. switchMap отписывается от прежней операции при новых параметрах. timer даёт задержку ввода. Это дебаунс с немедленной отменой предыдущего запроса; debounceTime отдельно здесь не нужен. catchError внутри switchMap превращает ошибку одного запроса в состояние, не завершает всю подписку. startWith сразу включает загрузку. shareReplay делится последним результатом; refCount освобождает ресурсы без подписчиков.

Важный момент: from(fetch(...)) сам по себе не отменяет сетевой запрос. Здесь Observable создаёт AbortController и возвращает `() => controller.abort()`, поэтому отписка останавливает fetch. Даже если старый Promise поздно завершится, закрытый Subscriber не передаст его данные.

## 5. Как работает авторизация

Форма отправляет username/password на /api/auth/login. Сервер проверяет BCrypt и возвращает два токена. startSession сохраняет их в sessionStorage и меняет поколение сессии. Затем /api/users/me возвращает актуальные данные без password_hash. Context сохраняет пользователя; защищённые маршруты становятся доступны.

На перезагрузке AuthProvider сначала восстанавливает пользователя. Пока ready=false, показывается загрузка, а не преждевременный redirect. При недоступности сервера есть повторное подключение. При 401 client пробует refresh один раз. Одновременные запросы ждут один Promise; это предотвращает лавину refresh. При неудачной аутентификации сессия очищается. Сетевой сбой не уничтожает токены автоматически.

Logout увеличивает номер поколения сессии. Если старый refresh закончится позже, номер не совпадёт и токены не запишутся обратно. Это предотвращает самопроизвольный вход после выхода.

Роль в интерфейсе нужна для удобства. Реальная защита — на backend. JwtAuthenticationFilter читает актуальную роль из базы при каждом запросе; старый ADMIN JWT после снятия роли не даёт прав. При 403 frontend запрашивает профиль заново.

## 6. Формы

Все поля управляемые: value/checked берутся из state; onChange вызывает setForm. Не используем getElementById для получения значений. Перед запросом validateStudent проверяет обязательность, формат группы, целые положительные числа и дату. Числовые поля HTML возвращают строки, поэтому перед отправкой вызываем Number. Проверяем безопасный диапазон ИСУ ID для JavaScript.

Полная правка выполняется PUT с заполненными полями. Примечание можно очистить пустой строкой. На backend остаётся собственная валидация. ErrorMessage показывает общую ошибку и details; поля формы также показывают отдельные сообщения.

useRef(lock) блокирует повторную отправку немедленно, до следующего render. saving отключает fieldset и меняет подпись кнопки. finally снимает блокировку и при успехе, и при ошибке. После сохранения navigate открывает карточку. Удаление подтверждается, выполняется DELETE; 204 не разбираем как JSON, затем перезагружаем текущую выборку.

## 7. Пагинация

page — индекс с нуля; пользователь видит page+1. size — размер страницы. total — число подходящих записей. totalPages — число страниц. Любое изменение фильтра/порядка сбрасывает page=0. После удаления последней записи страницы hook при необходимости запрашивает предыдущую существующую страницу. Пустая база показывает 0 из 0.

## 8. Что дополнено в backend

- ProfileController: GET /api/users/me берёт имя из Authentication, возвращает UserResponse.
- UserRepository.findPublicByUsername: SELECT только id/username/email/role.
- StudentFilters: дополнительные необязательные id/fullName/moveInDate/notes, связываются через @ModelAttribute.
- Controller → Service → Repository передают дополнительные фильтры; сортировка дополнена foreigner/notes.
- SecurityConfig отключает автоматическую servlet-регистрацию JWT-фильтра через FilterRegistrationBean. В SecurityFilterChain фильтр остаётся.
- AuthService.refresh сверяет ID токена и аккаунта, чтобы старый refresh не подошёл заново созданному аккаунту с прежним именем.
- AdminBootstrap: первичное создание нового ADMIN из .env; существующие пользователи не изменяются.

## 9. Docker

frontend/Dockerfile: Node устанавливает npm ci по lockfile, собирает dist; в финальный Nginx попадает только dist и конфигурация раздачи. Исходники и node_modules не нужны в работающем Nginx.

Compose связывает frontend/backend/postgres в общей сети. В Nginx backend:8000 — имя и внутренний порт контейнера. Из браузера запрос идёт на тот же origin /api. PostgreSQL доступен backend по postgres:5432, а не localhost. Volume сохраняет БД между перезапусками. Healthcheck ждёт готовность БД. JWT_SECRET не является VITE-переменной и никогда не попадает в frontend-сборку.

## 10. В каком порядке разбирать на защите

1. Покажи App.jsx и объясни страницу и маршрут.
2. Покажи StudentTable и передачу props.
3. Покажи useState в форме и Context для пользователя.
4. Введи поиск и покажи RxJS switchMap/очистку.
5. Покажи Network: URL с query и Bearer; не показывай реальные токены на публичных скриншотах.
6. Покажи backend: Controller → Service → Repository.
7. Войди USER и попробуй запрещённый маршрут: backend также вернёт 403.
8. Покажи Dockerfile: где сборка и где раздача файлов.

## Источники для повторения

- https://react.dev/learn — компоненты, state, props, эффекты.
- https://reactrouter.com/start/declarative/routing — маршруты и вложенные страницы.
- https://rxjs.dev/guide/overview — Observable и подписки.
- https://rxjs.dev/api/operators/switchMap — переключение запросов.
- https://vite.dev/guide/ — разработка и сборка.
- https://docs.spring.io/spring-security/reference/servlet/architecture.html — цепочки безопасности.
