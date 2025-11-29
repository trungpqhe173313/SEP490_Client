import API from "@/utils/axios";

export const worklogService = {
    getAllWorklogs: async (data) => {
        const response = await API.post('/worklogs/GetDataByDate', data);
        return response.data;
    },
    getWorklogById: async (id) => {
        const response = await API.get(`/worklogs/${id}`);
        return response.data;
    },
    createWorklog: async (data) => {
        const response = await API.post('/worklogs/create', data);
        return response.data;
    },
    updateWorklog: async (data) => {
        const response = await API.put(`/worklogs/update-batch`, data);
        return response.data;
    },
    checkIn: async (data) => {
        const response = await API.post('/worklogs/confirm', data);
        return response.data;
    },
}