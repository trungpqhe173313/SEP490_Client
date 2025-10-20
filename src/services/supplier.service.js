import API from '@/utils/axios';

export const supplierService = {
    getAllSuppliers: async () => {
        return API.get('/suppliers');
    },
    getSupplierByID: async (id) => {
        return API.get(`/suppliers/${id}`);
    },
    createSupplier: async (data) => {
        return API.post('/suppliers', data);
    },
    updateSupplier: async (id, data) => {
        return API.put(`/suppliers/${id}`, data);
    },
    deleteSupplier: async (id) => {
        return API.delete(`/suppliers/${id}`);
    }
};