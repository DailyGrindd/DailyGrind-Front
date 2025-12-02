import { useLocation } from "react-router-dom";
import { Header } from "../components/header";

export function Dashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-label">
      <Header currentView={location.pathname.includes("dashboard") ? "dashboard" : ""} />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-semibold mb-2">🏠 Bienvenido al Dashboard</h1>
      </main>
    </div>
  );
}