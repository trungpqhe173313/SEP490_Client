import API from '@/utils/axios';

export const importService = {
    getAllImports: async (data) => {
        const response = await API.post('/stockinput/GetData', data);
        return response.data;
    },

    getImportDetail: async (id) => {
        const response = await API.get(`/stockinput/GetDetail/${id}`);
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

    createImport: async (id,data) => {
        const response = await API.post(`/stockinput/CreateStockInputs/${id}`, data);
        return response.data;
    },
    deleteImport: async (id) => {
        const response = await API.delete(`/stockinput/DeleteImportTransaction/${id}`);
        return response.data;
    },
    updateImport: async (id, data) => {
        const response = await API.put(`/stockinput/UpdateImportTransaction/${id}`, data);
        return response.data;
    },
    updateToChecked: async (id) => {
        const response = await API.put(`/stockinput/UpdateToCheckedStatus/${id}`);
        return response.data;
    },
}