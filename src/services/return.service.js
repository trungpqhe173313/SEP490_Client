import API from "@/utils/axios";

export const returnService = {
    getAllReturns: async (data) => {
        const response = await API.post('/returnorder/GetData', data);
        return response.data;
    },
    getReturnDetail: async (id) => {
        const response = await API.get(`/returnorder/GetDetail/${id}`);
        return response.data;
    },
    createImportReturn: async (id, data) => {
        const response = await API.post(`/stockinput/ReturnOrder/${id}`, data);
        return response.data;
    },
    createExportReturn: async (id, data) => {
        const response = await API.post(`/stockoutput/ReturnOrder/${id}`, data);
        return response.data;
    },
};