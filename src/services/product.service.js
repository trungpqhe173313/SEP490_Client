import API from '@/utils/axios';

export const productService = {
    // getAllProducts: async () => {
    //     try {
    //         const response = await API.get('/products/GetData');
    //         return response.data;
    //     } catch (error) {
    //         console.log('Error in getAllProducts:', error);
    //     }
    // },
    getAllProducts: async () => {
        try {
            const response = await API.get('/products');
            return response;
        } catch (error) {
            console.log('Error in getAllProducts:', error);
        }
    },
    getProductByID: async (id) => {
        const response = await API.get(`/products/${id}`);
        return response;
    },
    createProduct: async (data) => {
        const response = await API.post('/products', data);
        return response;
    },
    updateProduct: async (id, data) => {
        const response = await API.put(`/products/${id}`, data);
        return response;
    },
    deleteProduct: async (id) => {
        const response = await API.delete(`/products/${id}`);
        return response;
    }
};
