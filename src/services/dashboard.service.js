import API from "@/utils/axios";

export const dashboardService = {
    getTopSellingProduct: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopSellingProduct?fromDate=${fromDate}&toDate=${toDate}`);
        return response.data;
    },
    getTopCustomerByTotalSpent: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopCustomerByTotalSpent?fromDate=${fromDate}&toDate=${toDate}`);
        return response.data;
    }
}