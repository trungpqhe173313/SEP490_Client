import API from "@/utils/axios";

export const paymentService = {
    getAllPayments: async (data) => {
        const response = await API.post('/financialtransaction/GetData', data);
        return response.data;
    },
    getDetail: async (id) => {
        const response = await API.get(`/financialtransaction/GetDetail/${id}`); 
        return response.data;
    },
    createPayment: async (data) => {
        const response = await API.post(`/financialtransaction/CreateFinancialTransaction?Type=${data.type}&Amount=${data.amount}&Description=${data.description}&PaymentMethod=${data.paymentMethod}&CreatedBy=${data.userId}`);
        return response.data;
    },
    updatePayment: async (id, data) => {
        const response = await API.put(`/financialtransaction/UpdateFinancialTransaction/${id}`, data);
        return response.data;
    },
    deletePayment: async (id) => {
        const response = await API.delete(`/financialtransaction/DeleteFinancialTransaction/${id}`); 
        return response.data;
    },
    createImportPayment: async (data) => {
        const response = await API.post(`/stockinput/CreatePartialPayment/${data.transactionId}?Amount=${data.amount}&Description=${data.description}&PaymentMethod=${data.paymentMethod}&CreatedBy=${data.userId}`);
        return response.data;
    },
    completeImportPayment: async (data) => {
        const response = await API.post(`/stockinput/UpdateToPaidInFullStatus/${data.transactionId}?Description=${data.description}&PaymentMethod=${data.paymentMethod}&CreatedBy=${data.userId}`);
        return response.data;
    },
    createExportPayment: async (data) => {
        const response = await API.post(`/stockoutput/CreatePartialPayment/${data.transactionId}?Amount=${data.amount}&Description=${data.description}&PaymentMethod=${data.paymentMethod}&CreatedBy=${data.userId}`);
        return response.data;
    },
    completeExportPayment: async (data) => {
        const response = await API.post(`/stockoutput/UpdateToPaidInFullStatus/${data.transactionId}?Description=${data.description}&PaymentMethod=${data.paymentMethod}&CreatedBy=${data.userId}`);
        return response.data;
    },
}