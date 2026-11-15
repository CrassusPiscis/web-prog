import AuthPage from "../../views/AuthPage";
export default async function Login({ searchParams }) {
  const { next } = await searchParams;
  return <AuthPage returnTo={next} />;
}
