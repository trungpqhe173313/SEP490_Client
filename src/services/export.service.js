import API from "@/utils/axios";

export const exportService = {
    getAllExports: async (data) => {
        const response = await API.post('/stockoutput/GetData', data);
        return response.data;
    },
    createExport: async (data) => {
        const response = await API.post('/stockoutput/CreateStockOutputs', data);
        return response.data;
    },
};