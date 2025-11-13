import API from "@/utils/axios";

export const priceService = {
    getAllPrices: async (data) => {
        const response = await API.post("/price/GetData", data);
        return response.data;
    },
};