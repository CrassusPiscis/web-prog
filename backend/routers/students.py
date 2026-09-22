# валидация введеных значений, все нужное из фастапи, классы с методами для работы
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from models import Student, StudentCreate, StudentUpdate
from services import student_service

router = APIRouter(
    prefix="/api/requests",
    tags=["students"]
)

# GET /api/requests
@router.get("", response_model=list[Student])
def get_students(
    group: Optional[str] = None,
    dormitory: Optional[str] = None,
    isuId: Optional[int] = None,
    room: Optional[int] = None,
    foreigner: Optional[bool] = None
):
    return student_service.get_all_students(
        group=group,
        dormitory=dormitory,
        isu_id=isuId,
        room=room,
        foreigner=foreigner
    )

# GET /api/requests/:id
@router.get("/{student_id}", response_model=Student)
def get_student(student_id: int):
    student = student_service.get_student_by_id(student_id)

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
def create_student(student: StudentCreate):
    if not student_service.is_isu_id_unique(student.isuId):
        raise HTTPException(
            status_code=409,
            detail="Студент с таким ИСУ ID уже существует"
        )

    # mode="json" - чтоб дата стала строчкой
    data = student.model_dump(mode="json")
    return student_service.create_student(data)


# PATCH /api/requests/:id
@router.patch(
    "/{student_id}",
    response_model=Student
)
def update_student(
    student_id: int,
    student: StudentUpdate
):
    existing_student = student_service.get_student_by_id(student_id)
    if existing_student is None:
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )
    data = student.model_dump(
        exclude_unset=True,
        mode="json"
    )
    if not data:
        raise HTTPException(
            status_code=400,
            detail="Не указаны данные для обновления"
        )
    if "isuId" in data:
        if not student_service.is_isu_id_unique(
            data["isuId"],
            exclude_id=student_id
        ):
            raise HTTPException(
                status_code=409,
                detail="Студент с таким ИСУ ID уже существует"
            )

    return student_service.update_student(
        student_id,
        data
    )


# DELETE /api/requests/:id
@router.delete(
    "/{student_id}",
    status_code=204
)
def delete_student(student_id: int):
    deleted = student_service.delete_student(student_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )
    return Response(status_code=204)


# QUERY /api/requests/:id
@router.api_route(
    "/{student_id}",
    methods=["QUERY"],
    response_model=Student
)
def query_student(student_id: int):
    student = student_service.get_student_by_id(student_id)
    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Студент не найден"
        )
    return student