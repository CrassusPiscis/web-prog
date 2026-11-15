import "../index.css";

export const metadata = {
  title: "Новая общага",
  description: "Система управления студентами общежития",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
