import { Navigate, Outlet } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouterProps {
    isAllowed: boolean;
    redirectTo?: string;
    children?: ReactNode;
}

export const ProtectedRouter = ({ isAllowed, children, redirectTo = "/login" }: ProtectedRouterProps) => {
    return isAllowed ? <>{children || <Outlet />}</> : <Navigate to={redirectTo} replace />;
};
