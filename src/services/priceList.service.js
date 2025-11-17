import API from "@/utils/axios";

export const priceListService = {
    getAllPriceLists: async (data) => {
        const response = await API.post("/pricelist/GetData", data);
        return response.data;
    },
    getPriceListByID: async (id) => {
        const response = await API.get(`/pricelist/GetDetail/${id}`);
        return response.data;
    },
    createPriceList: async (data) => {
        const response = await API.post("/pricelist/Create", data);
        return response.data;
    },
    updatePriceList: async (id, data) => {
        const response = await API.put(`/pricelist/Update/${id}`, data);
        return response.data;
    },
    updatePriceListDetail: async (id, data) => {
        const response = await API.put(`/pricelist/UpdatePriceListDetail/${id}`, data);
        return response.data;
    },
    deletePriceList: async (id) => {
        const response = await API.delete(`/pricelist/Delete/${id}`);
        return response.data;
    },
};