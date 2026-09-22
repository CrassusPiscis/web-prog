const API_URL = "http://127.0.0.1:8000/api/requests";
const form = document.getElementById("studentForm");
const errorMessage = document.getElementById("errorMessage");
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");

async function loadStudentForEdit() {
    if (!studentId) {
        return;
    }
    try {
        const response = await fetch(
            `${API_URL}/${studentId}`
        );
        if (response.status === 404) {
            errorMessage.textContent =
                "Студент не найден.";
            return;
        }
        if (!response.ok) {
            throw new Error(
                "Не удалось загрузить студента"
            );
        }
        const student = await response.json();
        document.getElementById("fullName").value =
            student.fullName;
        document.getElementById("group").value =
            student.group;
        document.getElementById("isuId").value =
            student.isuId;
        document.getElementById("dormitory").value =
            student.dormitory;
        document.getElementById("room").value =
            student.room;
        document.getElementById("moveInDate").value =
            student.moveInDate;
        document.getElementById("foreigner").checked =
            student.foreigner;
        document.getElementById("notes").value =
            student.notes || "";
    } catch (error) {
        console.error(error);
        errorMessage.textContent =
            "Ошибка соединения с сервером.";
    }
}


form.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        errorMessage.textContent = "";
        const fullName =
            document.getElementById("fullName").value.trim();
        const group =
            document.getElementById("group").value.trim();
        const isuId =
            Number(document.getElementById("isuId").value);
        const dormitory =
            document.getElementById("dormitory").value;
        const room =
            Number(document.getElementById("room").value);
        const moveInDate =
            document.getElementById("moveInDate").value;
        const foreigner =
            document.getElementById("foreigner").checked;
        const notes =
            document.getElementById("notes").value.trim();
        const groupPattern =
            /^[A-Za-z][0-9]{4}$/;
        if (!groupPattern.test(group)) {
            errorMessage.textContent =
                "Группа должна состоять из одной латинской буквы и четырёх цифр.";
            return;
        }
        const studentData = {
            fullName: fullName,
            group: group,
            isuId: isuId,
            dormitory: dormitory,
            room: room,
            moveInDate: moveInDate,
            foreigner: foreigner,
            notes: notes || null
        };
        try {
            let url = API_URL;
            let method = "POST";
            if (studentId) {
                url = `${API_URL}/${studentId}`;
                method = "PATCH";
            }


            const response = await fetch(
                url,
                {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(studentData)
                }
            );
            if (!response.ok) {
                const data = await response.json();
                errorMessage.textContent =
                    data.error?.message ||
                    "Ошибка сохранения студента";
                return;
            }
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            errorMessage.textContent =
                "Ошибка соединения с сервером.";
        }
    }
);

loadStudentForEdit();