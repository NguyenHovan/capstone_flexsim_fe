import { Navigate, Outlet } from "react-router-dom";
import { roleMap } from "../enum/role";

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const roleId = localStorage.getItem("roleId");

  if (!roleId) return <Navigate to="/" />;

  const roleString = roleMap[Number(roleId)];

  return allowedRoles.includes(roleString) ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
