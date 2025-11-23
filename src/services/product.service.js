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

    getProductBySupplier: async (data) => {
        const response = await API.post(`/products/GetProductBySupplier`, data);
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
    },

    importFromExcel: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await API.post('/products/ImportFromExcel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    downloadProductTemplate: async () => {
        const response = await API.get('/products/DownloadProductTemplate', {
            responseType: 'blob',
            headers: {
                Accept: '*/*'
            }
        });
        return response;
    }
};
