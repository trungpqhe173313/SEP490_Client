import API from '@/utils/axios';

export const categoryService = {
    getAllCategories: async () => {
        const response = await API.get('/categories');
        return response;
    },
    getCategoryByID: async (id) => {
        const response = await API.get(`/categories/${id}`);
        return response;
    },
    createCategory: async (data) => {
        const response = await API.post('/categories', data);
        return response;
    },
    updateCategory: async (id, data) => {
        const response = await API.put(`/categories/${id}`, data);
        return response;
    },
    deleteCategory: async (id) => {
        const response = await API.delete(`/categories/${id}`);
        return response;
    }
};
