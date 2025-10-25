import API from '@/utils/axios';

export const supplierService = {
    getAllSuppliers: async () => {
        const response = await API.get('/suppliers');
        return response;
    },
    getSupplierByID: async (id) => {
        const response = await API.get(`/suppliers/${id}`);
        return response;
    },
    createSupplier: async (data) => {
        const response = await API.post('/suppliers', data);
        return response;
    },
    updateSupplier: async (id, data) => {
        const response = await API.put(`/suppliers/${id}`, data);
        return response;
    },
    deleteSupplier: async (id) => {
        const response = await API.delete(`/suppliers/${id}`);
        return response;
    }
};
