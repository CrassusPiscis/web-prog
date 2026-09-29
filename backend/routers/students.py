from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from models import Student, StudentCreate, StudentUpdate, StudentQuery
from services import student_service


router = APIRouter(
    prefix="/api/requests",
    tags=["students"]
)


# GET /api/requests
@router.get("", response_model=list[Student])
async def get_students(
    group: Optional[str] = None,
    dormitory: Optional[str] = None,
    isuId: Optional[int] = None,
    room: Optional[int] = None,
    foreigner: Optional[bool] = None
):
    return await student_service.get_all_students(
        group=group,
        dormitory=dormitory,
        isu_id=isuId,
        room=room,
        foreigner=foreigner
    )


# GET /api/requests/:id
@router.get("/{student_id}", response_model=Student)
async def get_student(student_id: int):
    student = await student_service.get_student_by_id(student_id)

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )

    return student


# POST /api/requests
@router.post(
    "",
    response_model=Student,
    status_code=201
)
async def create_student(student: StudentCreate):
    data = student.model_dump(mode="json")

    created_student = await student_service.create_student(data)

    if created_student is None:
        raise HTTPException(
            status_code=409,
            detail="Студент с таким ИСУ ID уже существует"
        )

    return created_student


# PATCH /api/requests/:id
@router.patch(
    "/{student_id}",
    response_model=Student
)
async def update_student(
    student_id: int,
    student: StudentUpdate
):
    data = student.model_dump(
        exclude_unset=True,
        mode="json"
    )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Не указаны данные для обновления"
        )

    status, updated_student = await student_service.update_student(
        student_id,
        data
    )

    if status == "not_found":
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )

    if status == "duplicate":
        raise HTTPException(
            status_code=409,
            detail="Студент с таким ИСУ ID уже существует"
        )

    return updated_student


# DELETE /api/requests/:id
@router.delete(
    "/{student_id}",
    status_code=204
)
async def delete_student(student_id: int):
    deleted = await student_service.delete_student(student_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )

    return Response(status_code=204)


# QUERY /api/requests
@router.api_route(
    "",
    methods=["QUERY"],
    response_model=list[Student]
)
async def query_students(query: StudentQuery):
    return await student_service.get_all_students(
        group=query.group,
        dormitory=query.dormitory,
        isu_id=query.isuId,
        room=query.room,
        foreigner=query.foreigner
    )
