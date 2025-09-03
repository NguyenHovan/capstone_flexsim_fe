import axiosInstance from "./main.service";

export const DashboardService = {
  getDashboardInstructor: async () => {
    const userString = localStorage.getItem("currentUser");
    const currentUser = userString ? JSON.parse(userString) : null;
    const res = await axiosInstance.get(
      `/api/dashboard/instructors/${currentUser.id}`
    );
    return res.data;
  },
};
