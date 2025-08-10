import axiosInstance from '../api/axiosInstance';

export interface SystemStats {
  totalOrganizations: number;
  totalOrgAdmins: number;
  totalUsers: number;
  totalWorkspaces: number;
  pendingWorkspaces: number;
}

export const AdminService = {
  async getSystemStats(): Promise<SystemStats> {
    const [orgRes, userRes, workspaceRes] = await Promise.all([
      axiosInstance.get('/api/organization/get_all_organization'),
      axiosInstance.get('/api/account/get_all'),
      axiosInstance.get('/api/workspace/get_all_workSpace'),
    ]);

    const organizations = orgRes.data;
    const users = userRes.data;
    const workspaces = workspaceRes.data;

    // Đếm số lượng
    const totalOrganizations = organizations.length;
    const totalUsers = users.length;
    const totalOrgAdmins = users.filter((u: any) => u.roleId === 2).length;
    const totalWorkspaces = workspaces.length;
    const pendingWorkspaces = workspaces.filter((w: any) => w.status === 'pending').length;

    return {
      totalOrganizations,
      totalOrgAdmins,
      totalUsers,
      totalWorkspaces,
      pendingWorkspaces,
    };
  }
};
