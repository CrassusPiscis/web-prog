# реализуем непосресну работу с репкой
from repositories.student_repository import (
    get_students,
    save_students
)

# вывести всех студентов
def get_all_students(
    group=None,
    dormitory=None,
    isu_id=None,
    room=None,
    foreigner=None
):
    students = get_students()

    if group is not None:
        students = [
            student for student in students
            if student["group"] == group
        ]

    if dormitory is not None:
        students = [
            student for student in students
            if student["dormitory"] == dormitory
        ]

    if isu_id is not None:
        students = [
            student for student in students
            if student["isuId"] == isu_id
        ]

    if room is not None:
        students = [
            student for student in students
            if student["room"] == room
        ]

    if foreigner is not None:
        students = [
            student for student in students
            if student["foreigner"] == foreigner
        ]

    return students

# студень с конкретным айди
def get_student_by_id(student_id):
    students = get_students()
    for student in students:
        if student["id"] == student_id:
            return student
    return None

# проверка исушника на оригинальность (не учитывая собственно сравниваемого человека-студеня)
def is_isu_id_unique(isu_id, exclude_id=None):
    students = get_students()
    for student in students:
        if student["isuId"] == isu_id:
            if exclude_id is None or student["id"] != exclude_id:
                return False
    return True

# мегакрутейшаясверхиновационная система добавления студеня
def create_student(student_data):
    students = get_students()
    new_id = 1
    if students:
        new_id = max(
            student["id"]
            for student in students
        ) + 1
    student = {
        "id": new_id,
        **student_data
    }
    students.append(student)
    save_students(students)
    return student

# обноваление данных о студенте по айди
def update_student(student_id, student_data):
    students = get_students()
    for student in students:
        if student["id"] == student_id:
            student.update(student_data)
            save_students(students)
            return student
    return None

# прощаемся со студенем
def delete_student(student_id):
    students = get_students()
    for student in students:
        if student["id"] == student_id:
            students.remove(student)
            save_students(students)
            return True
    return False