import API from "@/utils/axios";
import { formatDateToInput } from "@/lib/formattingLib";

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
    },

    getImportWeight: async (fromDate, toDate) => {
        const response = await API.get(`/transaction/import-weight/?fromDate=${formatDateToInput(fromDate)}&toDate=${formatDateToInput(toDate)}`); 
        return response.data;
    },

    getExportWeight: async (fromDate, toDate) => {
        const response = await API.get(`/transaction/export-weight/?fromDate=${formatDateToInput(fromDate)}&toDate=${formatDateToInput(toDate)}`); 
        return response.data;
    },

    changeEmployee: async (id, data) => {
        const response = await API.put(`/transaction/UpdateResponsible/${id}`, data); 
        return response.data;
    }
};