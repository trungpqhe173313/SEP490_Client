import API from "@/utils/axios";

export const adminService = {
    getAllAccounts: async (data) => {
        const response = await API.post('/Admin/accounts', data);
        return response.data;
    },
    updateAccount: async (id, data) => {
        const response = await API.put(`/Admin/accounts/${id}`, data);
        return response.data;
    },
    getAllRoles: async () => {
        const response = await API.get('/Admin/roles');
        return response.data;
    },
}