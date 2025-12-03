import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { Home } from "../pages/home";
import { Dashboard } from "../pages/dashboard";
import { Users } from "../pages/users";
import { Challenges } from "../pages/challenges";
import { Daily } from "../pages/daily";
import { ProtectedRouter } from "./protectedRouter";
import { Profile } from "../pages/profile";
import { PublicProfile } from "../pages/publicProfile";

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
                            : <Navigate to="/daily" replace />
                        : <Login />
                }
            />

            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? user?.role === "Administrador"
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/daily" replace />
                        : <Register />
                }
            />

            <Route path="/home" element={<Home />} />
            
            {/* Ruta de Misiones Diarias */}
            <Route
                path="/daily"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated} redirectTo="/login">
                        <Daily />
                    </ProtectedRouter>
                }
            />
            
            {/* Nueva ruta de perfil */}
            <Route
                path="/profile"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated} redirectTo="/login">
                        <Profile />
                    </ProtectedRouter>
                }
            />
            
            <Route
                path="/profile/public/:userName"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated} redirectTo="/login">
                        <PublicProfile />
                    </ProtectedRouter>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated && user?.role === "Administrador"} redirectTo="/login">
                        <Dashboard />
                    </ProtectedRouter>
                }
            />

            <Route
                path="/users"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated && user?.role === "Administrador"} redirectTo="/login">
                        <Users />
                    </ProtectedRouter>
                }
            />

            <Route
                path="/challenges"
                element={
                    <ProtectedRouter isAllowed={isAuthenticated} redirectTo="/login">
                        <Challenges />
                    </ProtectedRouter>
                }
            />

            <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
    );
};
