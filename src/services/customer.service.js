import API from '@/utils/axios';

export const customerService = {
    getAllCustomers: async () => {
        const response = await API.get('/customers');
        return response.data;
    },
    getCustomerByID: async (id) => {
        const response = await API.get(`/customers/${id}`);
        return response.data;
    },
    createCustomer: async (data) => {
        const response = await API.post('/customers', data);
        return response.data;
    },
    updateCustomer: async (id, data) => {
        const response = await API.put(`/customers/${id}`, data);
        return response.data;
    },
    deleteCustomer: async (id) => {
        const response = await API.delete(`/customers/${id}`);
        return response.data;
    }
};