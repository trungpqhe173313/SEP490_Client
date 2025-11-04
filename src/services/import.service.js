import API from '@/utils/axios';

export const importService = {
    getAllImports: async (data) => {
        const response = await API.post('/stockinput/GetData', data);
        return response.data;
    },

    getTransactionDetail: async (id) => {
        const response = await API.get(`/stockinput/GetTransactionDetailByTransactionId/?id=${id}`);
        return response.data;
    },

    downloadTemplate: async () => {
        const response = await API.get('/stockinput/DownloadTemplate', {
            responseType: "blob",
            headers: {
                Accept: "*/*",
            }
        });
        return response;
    },

    createImportWithExcel: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await API.post("/stockinput/ImportFromExcel", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    createImport: async (data) => {
        const response = await API.post('/stockinput/CreateStockInputs', data);
        return response.data;
    },
    deleteImport: async (id) => {
        const response = await API.delete(`/imports/DeleteImport/${id}`);
        return response.data;
    },
    updateImport: async (id, data) => {
        const response = await API.put(`/imports/UpdateImport/${id}`, data);
        return response.data;
    },
}