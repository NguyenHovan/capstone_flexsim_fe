import axiosInstance from "./main.service";
import { API } from "../api";

import type { Account } from "../types/account";

export const AccountService = {
  updateAccount: async (id: string, payload: Account) => {
    const response = await axiosInstance.put(
      `${API.UPDATE_ACCOUNT}/${id}`,
      payload
    );
    return response.data;
  },
};
