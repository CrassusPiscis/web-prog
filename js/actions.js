function viewStudent(id) {
    window.location.href = `student.html?id=${id}`;
}
function editStudent(id) {
    window.location.href = `form.html?id=${id}`;
}
async function deleteStudent(id) {
    const confirmed = confirm(
        "Вы действительно хотите удалить этого студента?"
    );
    if (!confirmed) {
        return;
    }
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/requests/${id}`,
            {
                method: "DELETE"
            }
        );
        if (response.status === 204) {
            loadStudents();
            return;
        }
        const data = await response.json();
        alert(
            data.error?.message ||
            "Не удалось удалить студента"
        );
    } catch (error) {
        console.error(error);
        alert("Ошибка соединения с сервером");
    }
}