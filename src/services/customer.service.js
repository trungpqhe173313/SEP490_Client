import API from '@/utils/axios';

export const customerService = {
    getAllCustomers: async () => {
        return API.get('/customers');
    },
    getCustomerByID: async (id) => {
        return API.get(`/customers/${id}`);
    },
    createCustomer: async (data) => {
        return API.post('/customers', data);
    },
    updateCustomer: async (id, data) => {
        return API.put(`/customers/${id}`, data);
    },
    deleteCustomer: async (id) => {
        return API.delete(`/customers/${id}`);
    }
};