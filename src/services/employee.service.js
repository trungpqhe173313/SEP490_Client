import API from '@/utils/axios';

export const employeeService = {
    getAllEmployees: async (data) => {
        return API.get('/employees');
    },
    getEmployeeByID: async (id) => {
        return API.get(`/employees/${id}`);
    },
    createEmployee: async (data) => {
        return API.post('/employees', data);
    },
    updateEmployee: async (id, data) => {
        return API.put(`/employees/${id}`, data);
    },
    deleteEmployee: async (id) => {
        return API.delete(`/employees/${id}`);
    }
};