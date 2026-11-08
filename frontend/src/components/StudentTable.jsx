function StudentTable({ students, onDelete, emptyMessage = "Все студенты выселены"}) {
    return (
        <table>
                <thead>
                    <tr> 
                        <th>ФИО</th>
                        <th>Группа</th>
                        <th>Общежитие</th>
                        <th>Комната</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan={5}>{emptyMessage}</td>
                        </tr>
                    ) : (
                        students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.fullName}</td>
                            <td>{student.group}</td>
                            <td>{student.dormitory}</td>
                            <td>{student.room}</td>
                            <td>
                                <button 
                                type="button"
                                onClick={() => onDelete(student.id)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
    );
}

export default StudentTable;