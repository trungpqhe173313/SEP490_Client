import API from "@/utils/axios";

export const productionEmployeeService = {
    getMyProductionOrders: async (data) => {
        const response = await API.post('/production-employee/my-production-orders', data);
        return response.data;
    },
    getProductionDetail: async (id) => {
        const response = await API.get(`/production-employee/GetDetail/${id}`);
        return response.data;
    },
    startProduction: async (id, data) => {
        const response = await API.put(`/production-employee/ChangeToProcessing/${id}`, data);
        return response.data;
    },
    // completeProduction: async (id, data) => {
    //     const response = await API.put(`/production-employee/ChangeToFinished/${id}`, data);
    //     return response.data;
    // },
    submitForApproval: async (id, data) => {
        const response = await API.put(`/production-employee/SubmitForApproval/${id}`, data);
        return response.data;
    },
    getProductionWeight: async (id) => {
        return await API.get(`/production-weight-logs/summary/${id}`);
    },
    getAllDevices: async () => {
        return await API.get('/iot-devices');
    }
};
