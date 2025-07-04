export const useAuth = () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const token = localStorage.getItem("accessToken");
  return {
    user,
    token,
    isLoggedIn: !!token,
  };
};
