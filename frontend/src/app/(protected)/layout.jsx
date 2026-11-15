import { AuthProvider } from "../../auth/AuthContext";
import Layout from "../../components/Layout";
import { requireUser } from "../../server/data";

export default async function ProtectedLayout({ children }) {
  const user = await requireUser();
  return (
    <AuthProvider initialUser={user}>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}
