import API from "@/utils/axios";

export const inventoryService = {
    getAllInventories: async (data) => {
        const response = await API.post(`/Inventory/GetInventoryData`, data);
        return response.data;
    },

    getProductQuantity: async (data) => {
        const response = await API.post(`/Inventory/quantityProduct`, data);
        return response.data;
    },



    getAllStockAdjustments: async (data) => {
        const response = await API.post('/stock-adjustment/GetData', data);
        return response.data;
    },

    getStockAdjustmentDetail: async (id) => {
        const response = await API.get(`/stock-adjustment/Adjustment/${id}`);
        return response.data;
    },

    createStockAdjustment: async (data) => {
        const response = await API.post('/stock-adjustment/draft', data);
        return response.data;
    },

    updateStockAdjustment: async (id, data) => {
        const response = await API.put(`/stock-adjustment/draft/${id}`, data);
        return response.data;
    },

    deleteStockAdjustment: async (id) => {
        const response = await API.delete(`/stock-adjustment/draft/${id}`);
        return response.data;
    },

    resolveStockAdjustment: async (id) => {
        const response = await API.post(`/stock-adjustment/${id}/resolve`);
        return response.data;
    },
};