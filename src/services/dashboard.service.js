import API from "@/utils/axios";

export const dashboardService = {
    getTopSellingProduct: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopSellingProducts?fromDate=${fromDate}&toDate=${toDate}`);
        return response.data;
    },
    getTopCustomerByTotalSpent: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopCustomersByTotalSpent?fromDate=${fromDate}&toDate=${toDate}`);
        return response.data;
    }
}