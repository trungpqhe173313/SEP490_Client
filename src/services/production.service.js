import API from "@/utils/axios";

export const productionService = {
    getAllProductions: async (data) => {
        const response = await API.post('/production/GetData', data);
        return response.data;
    },
    getProductionDetail: async (id) => {
        const response = await API.get(`/production/GetDetail/${id}`);
        return response.data;
    },
    getProductQuantity: async (data) => {
        const response = await API.post(`/production/GetRawMaterialInventoryQuantity/`, data);
        return response.data;
    },
    createProduction: async (data) => {
        const response = await API.post('/production/CreateProductionOrder', data);
        return response.data;
    },
    updateProductionToFinish: async (id, data) => {
        const response = await API.put(`/production/ChangeToFinished/${id}`, data);
        return response.data;
    },
    updateProductionToReject: async (id, data) => {
        const response = await API.put(`/production/ChangeToRejected/${id}`, data);
        return response.data;
    },
    updateProductionToProcessing: async (id, data) => {
        const response = await API.put(`/production/ChangeToProcessing/${id}`, data);
        return response.data;
    },
    updateProductionToCancel: async (id) => {
        const response = await API.put(`/production/ChangeToCancel/${id}`);
        return response.data;
    },
    getAllDevices: async () => {
        return await API.get('/iot-devices');
    },
    getProductionWeight: async (id) => {
        return await API.get(`/production-weight-logs/summary/${id}`);
    }
};