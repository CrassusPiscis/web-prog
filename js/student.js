const API_URL = "http://127.0.0.1:8000/api/requests";
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");
const studentInfo = document.getElementById("studentInfo");

async function loadStudent() {
    if (!studentId) {
        studentInfo.textContent = "Не указан ID студента.";
        return;
    }
    try {
        const response = await fetch(
            `${API_URL}/${studentId}`
        );
        if (response.status === 404) {
            studentInfo.textContent = "Студент не найден.";
            return;
        }
        if (!response.ok) {
            throw new Error("Ошибка загрузки студента");
        }
        const student = await response.json();
        renderStudent(student);
    } catch (error) {
        console.error(error);
        studentInfo.textContent =
            "Ошибка соединения с сервером.";
    }
}

function renderStudent(student) {
    studentInfo.innerHTML = `
        <p>
            <strong>ФИО:</strong>
            ${escapeHTML(student.fullName)}
        </p>
        <p>
            <strong>Группа:</strong>
            ${escapeHTML(student.group)}
        </p>
        <p>
            <strong>ИСУ ID:</strong>
            ${escapeHTML(student.isuId)}
        </p>
        <p>
            <strong>Общежитие:</strong>
            ${escapeHTML(student.dormitory)}
        </p>
        <p>
            <strong>Комната:</strong>
            ${escapeHTML(student.room)}
        </p>
        <p>
            <strong>Срок заселения:</strong>
            ${escapeHTML(student.moveInDate)}
        </p>
        <p>
            <strong>Иностранец:</strong>
            ${student.foreigner ? "Да" : "Нет"}
        </p>
        <p>
            <strong>Заметки:</strong>
            ${escapeHTML(student.notes || "Нет")}
        </p>
    `;
}

loadStudent();