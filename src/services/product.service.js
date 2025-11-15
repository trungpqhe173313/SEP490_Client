import API from '@/utils/axios';

export const productService = {
    getAllProducts: async (data) => {
        const response = await API.post('/products/GetData', data);
        return response.data;
    },
    getProductAvailable : async (data) => {
        const response = await API.post('/products/GetProductAvailable', data);
        return response.data;
    },
    getProductsByWarehouse: async (id) => {
        const response = await API.get(`/products/GetProductsByWarehouse/${id}`);
        return response.data;
    },
    getProductByID: async (id) => {
        const response = await API.get(`/products/GetById/${id}`);
        return response.data;
    },
    createProduct: async (data) => {
        const response = await API.post('/products/CreateProduct', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    updateProduct: async (id, data) => {
        const response = await API.put(`/products/UpdateProduct/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteProduct: async (id) => {
        const response = await API.delete(`/products/DeleteProduct/${id}`);
        return response.data;
    }
};
