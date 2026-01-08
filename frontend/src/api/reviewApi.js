import api from "./axiosClient";

const reviewApi = {

    getAllByTour: (tourId) => api.get(`/tours/${tourId}/reviews`),

    createForTour: (tourId, payload) => api.post(`/tours/${tourId}/reviews`, payload),

    getAllByUser: (userId) => api.get(`/users/${userId}/reviews`),

    createForUser: (userId, payload) => api.post(`/users/${userId}/reviews`, payload),

    remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default reviewApi;