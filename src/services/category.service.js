import API from '@/utils/axios';

export const categoryService = {
    getAllCategories: async () => {
        return API.get('/categories');
    },
    getCategoryByID: async (id) => {
        return API.get(`/categories/${id}`);
    },
    createCategory: async (data) => {
        return API.post('/categories', data);
    },
    updateCategory: async (id, data) => {
        return API.put(`/categories/${id}`, data);
    },
    deleteCategory: async (id) => {
        return API.delete(`/categories/${id}`);
    }
};