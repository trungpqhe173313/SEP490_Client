import API from "@/utils/axios";

export const exportService = {
    getAllExports: async (data) => {
        const response = await API.post('/stockoutput/GetData', data);
        return response.data;
    },
    getExportDetail: async (id) => {
        const response = await API.get(`/stockoutput/GetDetail/${id}`);
        return response.data;
    },  
    createExport: async (id, data) => {
        const response = await API.post(`/stockoutput/CreateOrder/${id}`, data);
        return response.data;
    },
    updateExport: async (id, data) => {
        const response = await API.put(`/stockoutput/UpdateOrder/${id}`, data);
        return response.data;
    },
};