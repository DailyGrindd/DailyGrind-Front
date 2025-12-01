import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { Home } from "../pages/home";
import { Dashboard } from "../pages/dashboard";
import { ProtectedRouter } from "./protectedRouter";

export const AppRouter = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    // Removido: if (loading) return null; 
    // Esto causaba que la página se pusiera en blanco durante cualquier proceso de autenticación

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? user?.role === "Administrador"
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/home" replace />
                        : <Login />
                }
            />

            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? user?.role === "Administrador"
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/home" replace />
                        : <Register />
                }
            />

            <Route path="/home" element={<Home />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated} redirectTo="/login">
                        <Dashboard />
                    </ProtectedRouter>
                }
            />

            <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
    );
};
