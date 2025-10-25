import API from '@/utils/axios';

export const employeeService = {
    getAllEmployees: async () => {
        const response = await API.get('/employees');
        return response.data;
    },
    getEmployeeByID: async (id) => {
        const response = await API.get(`/employees/${id}`);
        return response.data;
    },
    createEmployee: async (data) => {
        const response = await API.post('/employees', data);
        return response.data;
    },
    updateEmployee: async (id, data) => {
        const response = await API.put(`/employees/${id}`, data);
        return response.data;
    },
    deleteEmployee: async (id) => {
        const response = await API.delete(`/employees/${id}`);
        return response.data;
    }
};
