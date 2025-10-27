import API from '@/utils/axios';

export const employeeService = {
    getAllEmployees: async (data) => {
        const response = await API.post('/employees/GetData', data);
        return response.data;
    },
    getEmployeeByID: async (id) => {
        const response = await API.get(`/employees/GetByUserId/${id}`);
        return response.data;
    },
    createEmployee: async (data) => {
        const response = await API.post('/employees/CreateEmployee', data);
        return response.data;
    },
    updateEmployee: async (id, data) => {
        const response = await API.put(`/employees/UpdateEmployee/${id}`, data);
        return response.data;
    },
    deleteEmployee: async (id) => {
        const response = await API.delete(`/employees/DeleteEmployee/${id}`);
        return response.data;
    }
};
