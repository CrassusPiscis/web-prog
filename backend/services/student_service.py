from repositories.student_repository import (
    get_students,
    change_students
)


async def get_all_students(
    group=None,
    dormitory=None,
    isu_id=None,
    room=None,
    foreigner=None
):
    students = await get_students()

    if group is not None:
        students = [
            s for s in students
            if s["group"] == group
        ]

    if dormitory is not None:
        students = [
            s for s in students
            if s["dormitory"] == dormitory
        ]

    if isu_id is not None:
        students = [
            s for s in students
            if s["isuId"] == isu_id
        ]

    if room is not None:
        students = [
            s for s in students
            if s["room"] == room
        ]

    if foreigner is not None:
        students = [
            s for s in students
            if s["foreigner"] == foreigner
        ]

    return students


async def get_student_by_id(student_id):
    students = await get_students()

    for student in students:
        if student["id"] == student_id:
            return student

    return None



async def create_student(student_data):

    def operation(students):
        for student in students:
            if student["isuId"] == student_data["isuId"]:
                return None, False

        new_id = max(
            (student["id"] for student in students),
            default=0
        ) + 1

        new_student = {
            "id": new_id,
            **student_data
        }

        students.append(new_student)

        return new_student, True

    return await change_students(operation)


async def update_student(student_id, student_data):

    def operation(students):
        target = None

        for student in students:
            if student["id"] == student_id:
                target = student
                break

        if target is None:
            return ("not_found", None), False

        if "isuId" in student_data:
            new_isu_id = student_data["isuId"]

            for student in students:
                if (
                    student["isuId"] == new_isu_id
                    and student["id"] != student_id
                ):
                    return ("duplicate", None), False

        target.update(student_data)

        return ("ok", target), True

    return await change_students(operation)


async def delete_student(student_id):

    def operation(students):
        for student in students:
            if student["id"] == student_id:
                students.remove(student)
                return True, True

        return False, False

    return await change_students(operation)
