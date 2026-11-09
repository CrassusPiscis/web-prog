import { Link, Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import StudentsPage from "./pages/StudentsPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import StudentFormPage from "./pages/StudentFormPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route
        path="/register"
        element={<AuthPage key="register" registering />}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/students" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<ProtectedRoute admin />}>
            <Route
              path="students/new"
              element={<StudentFormPage key="new" />}
            />
            <Route
              path="students/:id/edit"
              element={<StudentFormPage key="edit" />}
            />
          </Route>
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <main className="container content">
            <h1>Страница не найдена</h1>
            <Link to="/students">На главную</Link>
          </main>
        }
      />
    </Routes>
  );
}
