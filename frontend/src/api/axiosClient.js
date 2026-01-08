import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }


        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            // Otherwise, default to JSON
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;