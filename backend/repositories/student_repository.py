# тут работа со студень-репозиторием
# конкретно - с JSON'ом
import json
from pathlib import Path

# местонахождение файлов студеней
DATA_FILE = Path(__file__).parent.parent / "data" / "students.json"

# получить файлы студеней
def get_students():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

# сохранить студеней 
def save_students(students):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(
            students,
            file,
            ensure_ascii=False,
            indent=4
        )