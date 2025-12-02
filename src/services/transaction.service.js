import API from "@/utils/axios";

export const transactionService = {
    printTransaction: async (id) => {
        const response = await API.get(`/print/Print/${id}`, {
            responseType: 'blob',
            headers: {
                Accept: '*/*'
            }
        });
        return response;
    },
    
    getTransactionDetail: async (id) => {
        const response = await API.get(`/transaction/${id}`);
        return response.data;
    }
};