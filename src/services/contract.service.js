import API from "@/utils/axios";

export const contractService = {
    getAllContracts: async (data) => {
        const response = await API.post('/contract/GetData', data);
        return response.data;
    },
    createContract: async (data) => {
        const response = await API.post('/contract/CreateContract', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    updateContract: async (id, data) => {
        const response = await API.put(`/contract/UpdateContract/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
    });
        return response.data;
    },
    getContractByID: async (id) => {
        const response = await API.get(`/contract/GetById/${id}`);
        return response.data;
    },
    deleteContract: async (id) => {
        const response = await API.delete(`/contract/DeleteContract/${id}`);
        return response.data;
    }
};