import asyncio
import json
import os
import tempfile
from pathlib import Path


DATA_FILE = Path(__file__).parent.parent / "data" / "students.json"

file_lock = asyncio.Lock()

def _read_file():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def _write_file(students):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    temporary_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=DATA_FILE.parent,
            suffix=".json",
            delete=False
        ) as file:
            temporary_path = file.name

            json.dump(
                students,
                file,
                ensure_ascii=False,
                indent=4
            )

        os.replace(temporary_path, DATA_FILE)

    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)


async def get_students():
    async with file_lock:
        return await asyncio.to_thread(_read_file)


async def change_students(operation):
    async with file_lock:
        students = await asyncio.to_thread(_read_file)

        result, should_save = operation(students)

        if should_save:
            await asyncio.to_thread(_write_file, students)

        return result
