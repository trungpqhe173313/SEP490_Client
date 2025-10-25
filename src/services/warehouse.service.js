import API from "@/utils/axios";

export const warehouseService = {
    getAllWarehouses: async () => {
        const response = await API.get("/warehouses");
        return response;
    },
    getWarehouseByID: async (id) => {
        const response = await API.get(`/warehouses/${id}`);
        return response;
    },
    createWarehouse: async (data) => {
        const response = await API.post("/warehouses", data);
        return response;
    },
    updateWarehouse: async (id, data) => {
        const response = await API.put(`/warehouses/${id}`, data);
        return response;
    },
    deleteWarehouse: async (id) => {
        const response = await API.delete(`/warehouses/${id}`);
        return response;
    },
};