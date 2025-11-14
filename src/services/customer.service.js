import API from '@/utils/axios';

export const customerService = {
    getAllCustomers: async (data) => {
        const response = await API.post('/customers/GetData', data);
        return response.data;
    },
    getCustomerByID: async (id) => {
        const response = await API.get(`/customers/GetByUserId/${id}`);
        return response.data;
    },
    createCustomer: async (data) => {
        const response = await API.post('/customers/CreateCustomer', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    updateCustomer: async (id, data) => {
        const response = await API.put(`/customers/UpdateCustomer/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteCustomer: async (id) => {
        const response = await API.delete(`/customers/DeleteCustomer/${id}`);
        return response.data;
    }
};