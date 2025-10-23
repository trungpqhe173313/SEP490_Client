import API from '@/utils/axios';

export const productService = {
    getAllProducts: async () => {
        const response = await API.get('/products');
        return response;
    },
    getProductByID: async (id) => {
        const response = await API.get(`/products/${id}`);
        return response;
    },
    createProduct: async (data) => {
        const response = await API.post('/products', { body: data });
        return response;
    },
    updateProduct: async (id, data) => {
        const response = await API.put(`/products/${id}`, { body: data });
        return response;
    },
    deleteProduct: async (id) => {
        const response = await API.delete(`/products/${id}`);
        return response;
    }
};
