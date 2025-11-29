import API from "@/utils/axios";

export const jobService = {
    getAllJobs: async () => {
        const response = await API.get('/jobs');
        return response.data;
    },
    getJobById: async (id) => {
        const response = await API.get(`/jobs/${id}`);
        return response.data;
    },
    createJob: async (data) => {
        const response = await API.post('/jobs', data);
        return response.data;
    },
    updateJob: async (data) => {
        const response = await API.put('/jobs', data);
        return response.data;
    },
    deleteJob: async (id) => {
        const response = await API.delete(`/jobs/${id}`);
        return response.data;
    },
}