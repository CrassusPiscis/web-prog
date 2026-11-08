import { useState } from "react";
import StudentTable from "../components/StudentTable";
import StudentFilters from "../components/StudentFilters";

function StudentsPage() {
    const [students, setStudents] = useState([
        {
            id: 1,
            fullName: "Jotaro Kujo",
            group: "P3221", 
            dormitory: "Белорусская 6",
            room: 907,
        },
        {
            id: 2,
            fullName: "Joseph Joestar",
            group: "P3221", 
            dormitory: "Белорусская 6",
            room: 907,
        }
    ]);

    const [search, setSearch] = useState("");
    const [dormitory, setDormitory] = useState("");
    const [sortBy, setSortBy] = useState("fullName");

    function removeStudent(id) {
        setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== id)
        );
    }

    const normalizedSearch = search.trim().toLowerCase();

    const dormitories = [
        ...new Set(students.map((student) => student.dormitory)),
    ];
    
    const filteredStudents = students.filter((student) => {
        const matchesSearch = student.fullName
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesDormitory =
            dormitory === "" || student.dormitory === dormitory;

        return matchesSearch && matchesDormitory;
        });

        const sortedStudents = [...filteredStudents].sort((first, second) => {
        if (sortBy === "room") {
            return first.room - second.room;
        }

        return first.fullName.localeCompare(second.fullName, "ru");
        });

    return (
        <main>
            <h1>Студенты </h1>
            <p>Здесь можно посмотреть студентов и управляеть записями.</p>
            <p>Всего студентов: {students.length}</p>
            <p>Найдено: {filteredStudents.length}</p>

            <button type="button"> Добавить студента</button>

            <StudentFilters
            search={search}
            onSearchChange={setSearch}
            dormitory={dormitory}
            onDormitoryChange={setDormitory}
            dormitories={dormitories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            />

            <StudentTable
            students={sortedStudents}
            onDelete={removeStudent}
            emptyMessage={
                students.length === 0
                ? "Все студенты выселены"
                : "По вашему запросу никого не найдено"
            }
            />
        </main>
    );
}

export default StudentsPage;
