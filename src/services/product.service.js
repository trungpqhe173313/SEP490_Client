import API from '@/utils/axios';

export const productService = {
    getAllProducts: async () => {
        return API.get('/products');
    },
    getProductByID: async (id) => {
        return API.get(`/products/${id}`);
    },
    createProduct: async (data) => {
        return API.post('/products', data);
    },
    updateProduct: async (id, data) => {
        return API.put(`/products/${id}`, data);
    },
    deleteProduct: async (id) => {
        return API.delete(`/products/${id}`);
    }
};