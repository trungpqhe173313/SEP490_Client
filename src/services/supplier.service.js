import API from '@/utils/axios';

export const supplierService = {
    getAllSuppliers: async (data) => {
        const response = await API.post('/suppliers/GetData', data);
        return response.data;
    },
    getSupplierByID: async (id) => {
        const response = await API.get(`/suppliers/GetBySupplierId/${id}`);
        return response.data;
    },
    createSupplier: async (data) => {
        const response = await API.post('/suppliers/CreateSupplier', data);
        return response.data;
    },
    updateSupplier: async (id, data) => {
        const response = await API.put(`/suppliers/UpdateSupplier/${id}`, data);
        return response.data;
    },
    deleteSupplier: async (id) => {
        const response = await API.delete(`/suppliers/DeleteSupplier/${id}`);
        return response.data;
    }
};
