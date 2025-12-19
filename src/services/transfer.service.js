import API from "@/utils/axios";

export const transferService = {
    getAllTransfers: async (data) => {
        const response = await API.post('/stocktransfer/GetData', data);
        return response.data;
    },
    getTransferDetail: async (id) => {
        const response = await API.get(`/stocktransfer/GetDetail/${id}`);
        return response.data;
    },
    createTransfer: async (data) => {
        const response = await API.post('/stocktransfer/CreateTransferOrder', data);
        return response.data;
    },
    updateTransfer: async (id, data) => {
        const response = await API.put(`/stocktransfer/UpdateTransferOrder/${id}`, data);
        return response.data;
    },
    completeTransfer: async (id, data) => {
        const response = await API.put(`/stocktransfer/UpdateToTransferredStatus/${id}`, data);
        return response.data;  
    },
    cancelTransfer: async (id) => {
        const response = await API.put(`/stocktransfer/CancelTransferOrder/${id}`);
        return response.data;
    },
}