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
        if (!data || !id) return;
        const status = data.status;
        let response;
        if (status === 1) response = await API.put(`/stockoutput/UpdateTransactionInDraftStatus/${id}`, data);
        else if (status === 2) response = await API.put(`/stockoutput/UpdateTransactionInOrderStatus/${id}`, data);
        return response.data;
    },
    updateToOrder: async (id, data) => {
        const response = await API.put(`/stockoutput/UpdateToOrderStatus/${id}`, data);
        return response.data;
    },
    updateToDelivering: async (id, data) => {
        const response = await API.put(`/stockoutput/UpdateToDeliveringStatus/${id}`, data);
        return response.data;
    },
    updateToDone: async (id, data) => {
        const response = await API.put(`/stockoutput/UpdateToDoneStatus/${id}`, data);
        return response.data;
    },
    deleteExport: async (id) => {
        const response = await API.delete(`/stockoutput/DeleteTransaction/${id}`);
        return response.data;
    },
    cancelExport: async (id) => {
        const response = await API.put(`/stockoutput/UpdateToCancelStatus/${id}`);
        return response.data;
    },
    cancelExportOrder: async (id) => {
        const response = await API.put(`/stockoutput/CancelOrderAndReturnStock/${id}`);
        return response.data;
    },
};