import API from "@/utils/axios";
import { formatDateToInput } from "@/lib/formattingLib";

export const dashboardService = {
    getTopSellingProduct: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopSellingProducts?fromDate=${formatDateToInput(fromDate)}&toDate=${formatDateToInput(toDate)}`);
        return response.data;
    },
    getTopCustomerByTotalSpent: async (fromDate, toDate) => {
        const response = await API.get(`/analytics/GetTopCustomersByTotalSpent?fromDate=${formatDateToInput(fromDate)}&toDate=${formatDateToInput(toDate)}`);
        return response.data;
    }
}