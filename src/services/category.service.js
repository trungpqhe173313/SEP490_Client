import API from '@/utils/axios';

export const categoryService = {
    getAllCategories: async (data) => {
        const response = await API.post('/categories/GetData', data);
        return response.data;
    },
    getCategoryByID: async (id) => {
        const response = await API.get(`/categories/GetById/${id}`);
        return response.data;
    },
    createCategory: async (data) => {
        const response = await API.post('/categories/CreateCategory', data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await API.put(`/categories/UpdateCategory/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await API.delete(`/categories/DeleteCategory/${id}`);
        return response.data;
    }
};
