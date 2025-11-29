import API from "@/utils/axios";

export const payrollService = {
    getAllPayroll: async (year, month) => {
        const response = await API.get(`/payroll/overview?year=${year}&month=${month}`);
        return response.data;
    },
    createPayroll: async (data) => {
        const response = await API.post('/payroll/create', data);
        return response.data;
    },
    payPayroll: async (data) => {
        const response = await API.post('/payroll/pay', data);
        return response.data;
    },
    getPayrollById: async (id) => {
        const response = await API.get(`/payroll/${id}`);
        return response.data;
    },
};