let currentPage = 0;
const API_URL = "/api/requests";
const tableBody = document.getElementById("studentsTableBody");
const filterForm = document.getElementById("filterForm");
const resetFiltersButton = document.getElementById("resetFilters");


async function loadStudents() {
    try {
        const group = document.getElementById("filterGroup").value.trim();
        const dormitory = document.getElementById("filterDormitory").value;
        const params = new URLSearchParams({ page: currentPage, size: 10, search: document.getElementById("search").value.trim(), sortBy: document.getElementById("sortBy").value, direction: document.getElementById("direction").value });

        if (group !== "") {
            params.append("group", group);
        }

        if (dormitory !== "") {
            params.append(
                "dormitory",
                dormitory
            );
        }

        let url = API_URL;
        if (params.toString() !== "") {
            url += "?" + params.toString();
        }

        const response = await apiFetch(url);
        if (!response.ok) {
            throw new Error(
                "Не удалось загрузить студентов"
            );
        }

        const students = await response.json();
        renderStudents(students.items);
        document.getElementById("pageInfo").textContent = `${students.page + 1} / ${Math.max(1, students.totalPages)} (${students.total})`;
        document.getElementById("nextPage").disabled = students.page + 1 >= students.totalPages;
        document.getElementById("prevPage").disabled = students.page === 0;
    } catch (error) {
        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Ошибка загрузки студентов
                </td>
            </tr>
        `;
    }
}

function renderStudents(students) {
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Студенты не найдены
                </td>
            </tr>
        `;

        return;
    }

    students.forEach(function (student) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(student.fullName)}</td>
            <td>${escapeHTML(student.group)}</td>
            <td>${escapeHTML(student.isuId)}</td>
            <td>${escapeHTML(student.dormitory)}</td>
            <td>${escapeHTML(student.room)}</td>
            <td>${student.foreigner ? "Да" : "Нет"}</td>
            <td>
                <button onclick="viewStudent(${student.id})">
                    Просмотр
                </button>
                <button ${currentRole() !== "ADMIN" ? "hidden" : ""} onclick="editStudent(${student.id})">
                    Изменить
                </button>
                <button ${currentRole() !== "ADMIN" ? "hidden" : ""} onclick="deleteStudent(${student.id})">
                    Удалить
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

filterForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();
        currentPage = 0;
        loadStudents();
    }
);

resetFiltersButton.addEventListener(
    "click",
    function () {
        currentPage = 0;
        filterForm.reset();
        document.getElementById("filterGroup").value = "";
        document.getElementById("filterDormitory").value = "";
        loadStudents();
    }
);

loadStudents();
document.getElementById("nextPage").onclick = () => { currentPage++; loadStudents(); };
document.getElementById("prevPage").onclick = () => { if (currentPage > 0) currentPage--; loadStudents(); };
