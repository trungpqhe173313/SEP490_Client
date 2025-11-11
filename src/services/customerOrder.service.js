import API from "@/utils/axios";

export const customerOrderService = {
    getAllCustomerOrder: async (data) => {
        const response = await API.post(`/customerorder/GetOrderList`, data);
        return response.data;
    },
    getCustomerOrderById: async (id) => {
        const response = await API.get(`/customerorder/GetDetail/${id}`);
        return response.data;
    },
    getOrderHistory: async (data) => {
        const response = await API.post(`/customerorder/GetOrderHistory`, data);
        return response.data;
    },
};