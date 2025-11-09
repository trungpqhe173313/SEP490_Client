import API from "@/utils/axios";

export const contractService = {
    getAllContracts: async (data) => {
        const response = await API.post('/contracts/GetData', data);
        return response.data;
    },
    createContract: async (data) => {
        const response = await API.post('/contracts/CreateContract', data);
        return response.data;
    },
    updateContract: async (id, data) => {
        const response = await API.put(`/contracts/UpdateContract/${id}`, data);
        return response.data;
    },
    getContractByID: async (id) => {
        const response = await API.get(`/contracts/GetById/${id}`);
        return response.data;
    },
    deleteContract: async (id) => {
        const response = await API.delete(`/contracts/DeleteContract/${id}`);
        return response.data;
    }
};