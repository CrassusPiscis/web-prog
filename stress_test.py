"""Проверка 20 одновременных POST-запросов к API студентов.

Запуск из PowerShell:
    python stress_test.py

ВНИМАНИЕ: добавляет 20 тестовых студентов в students.json через API.
Перед запуском сделайте резервную копию файла данных.
"""

import json
import secrets
import threading
import urllib.error
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed


API_URL = "http://127.0.0.1:8000/api/requests"
REQUEST_COUNT = 20
barrier = threading.Barrier(REQUEST_COUNT)

# Уникальный набор ИСУ ID для одного запуска теста.
first_isu_id = secrets.randbelow(800_000_000) + 100_000_000


def send_student(index):
    student = {
        "fullName": f"Нагрузочный Тест {index + 1}",
        "group": "T1234",
        "isuId": first_isu_id + index,
        "dormitory": "Белорусская улица, 6",
        "room": 100 + index,
        "moveInDate": "2026-09-29",
        "foreigner": False,
        "notes": "Тест параллельной записи JSON"
    }

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(student, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    # Все потоки ждут здесь друг друга и почти одновременно начинают POST.
    barrier.wait(timeout=15)

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8")
            return index, response.status, json.loads(body)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return index, error.code, body
    except Exception as error:
        return index, "ERROR", str(error)


def main():
    print(f"Отправляем {REQUEST_COUNT} одновременных POST-запросов...")
    print("Тестовые ИСУ ID:", first_isu_id, "—", first_isu_id + REQUEST_COUNT - 1)

    results = []
    with ThreadPoolExecutor(max_workers=REQUEST_COUNT) as executor:
        futures = [executor.submit(send_student, i) for i in range(REQUEST_COUNT)]
        for future in as_completed(futures):
            results.append(future.result())

    statuses = Counter(str(status) for _, status, _ in results)
    print("\nОтветы POST:", dict(statuses))
    for index, status, body in sorted(results):
        if status != 201:
            print(f"  Запрос {index + 1}: {status} — {body}")

    print("\nПроверяем фактическое содержимое через GET /api/requests...")
    try:
        with urllib.request.urlopen(API_URL, timeout=20) as response:
            students = json.loads(response.read().decode("utf-8"))
    except Exception as error:
        print("Не удалось получить список студентов:", error)
        return

    test_isu_ids = set(range(first_isu_id, first_isu_id + REQUEST_COUNT))
    found = [s for s in students if s.get("isuId") in test_isu_ids]
    found_isu_ids = {s["isuId"] for s in found}
    missing = sorted(test_isu_ids - found_isu_ids)
    ids = [s.get("id") for s in found]
    repeated_ids = [value for value, count in Counter(ids).items() if count > 1]

    print(f"Фактически найдено: {len(found)} из {REQUEST_COUNT}")
    print(f"Отсутствующих ИСУ ID: {len(missing)}")
    print(f"Повторяющихся внутренних ID среди тестовых записей: {len(repeated_ids)}")

    if missing:
        print("Потерянные ИСУ ID:", missing)
    if repeated_ids:
        print("Повторяющиеся внутренние ID:", repeated_ids)

    if statuses.get("201", 0) == REQUEST_COUNT and len(found) == REQUEST_COUNT and not repeated_ids:
        print("\nPASS: все 20 запросов успешны, записи сохранены, ID уникальны.")
    else:
        print("\nFAIL: обнаружена потеря данных, конфликт ID или ошибка запросов.")

    print("\nТестовые записи оставлены в JSON для проверки преподавателем.")


if __name__ == "__main__":
    main()
