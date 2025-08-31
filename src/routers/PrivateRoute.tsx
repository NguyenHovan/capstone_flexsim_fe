// import { Navigate, Outlet } from "react-router-dom";
// import { roleMap } from "../enum/role";

// const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
//   const roleId = localStorage.getItem("roleId");

//   if (!roleId) return <Navigate to="/" />;

//   const roleString = roleMap[Number(roleId)];

//   return allowedRoles.includes(roleString) ? <Outlet /> : <Navigate to="/" />;
// };

// routes/PrivateRoute.tsx
// src/routes/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; 

const roleMap: Record<number, string> = {
  1: "admin",
  2: "organizationAdmin",
  3: "instructor",
  4: "student",
};

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const rawUser = localStorage.getItem("currentUser");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  const user = rawUser ? safeParse(rawUser) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const expired = !loginTime || Date.now() - loginTime >= TOKEN_TTL_MS;
  if (expired) {
    localStorage.clear();
    toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    return <Navigate to="/login" replace />;
  }

  if (user?.isEmailVerify === false) {
    sessionStorage.setItem(
      "pendingVerify",
      JSON.stringify({ userName: user?.userName })
    );
    return <Navigate to="/verify-code" replace />;
  }

  const roleKey = roleMap[user.roleId] ?? "";
  if (allowedRoles.length && !allowedRoles.includes(roleKey)) {
    toast.warning("Bạn không có quyền truy cập trang này.");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function safeParse<T = any>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export default PrivateRoute;

