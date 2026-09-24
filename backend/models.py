# вся логика для валидации данных
# библиотеки для проверки, преобразования и структурирования данных
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# непосресна, сам студень
class Student(BaseModel):
    id: int
    fullName: str = Field(min_length=1)
    group: str = Field(pattern=r"^[A-Za-z][0-9]{4}$")
    isuId: int = Field(gt=0)
    dormitory: str = Field(min_length=1)
    room: int = Field(gt=0)
    moveInDate: date
    foreigner: bool
    notes: Optional[str] = None

# создание студента
class StudentCreate(BaseModel):
    fullName: str = Field(min_length=1)
    group: str = Field(pattern=r"^[A-Za-z][0-9]{4}$")
    isuId: int = Field(gt=0)
    dormitory: str = Field(min_length=1)
    room: int = Field(gt=0)
    moveInDate: date
    foreigner: bool
    notes: Optional[str] = None

# обновление его данных
class StudentUpdate(BaseModel):
    fullName: Optional[str] = Field(
        default=None,
        min_length=1
    )

    group: Optional[str] = Field(
        default=None,
        pattern=r"^[A-Za-z][0-9]{4}$"
    )

    isuId: Optional[int] = Field(default=None, gt=0)
    dormitory: Optional[str] = None
    room: Optional[int] = Field(default=None, gt=0)
    moveInDate: Optional[date] = None
    foreigner: Optional[bool] = None
    notes: Optional[str] = None

#
class StudentQuery(BaseModel):
    group: Optional[str] = None
    dormitory: Optional[str] = None
    isuId: Optional[int] = None
    room: Optional[int] = None
    foreigner: Optional[bool] = None