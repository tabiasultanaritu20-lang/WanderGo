import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api", // Make sure this matches your backend
    // REMOVED: headers: { "Content-Type": "application/json" }
    // ^ Do not set a global default here, let Axios handle it dynamically
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // --- THE CRITICAL FIX ---
        // If sending FormData (Image Upload), delete the Content-Type header
        // This lets the browser set it to "multipart/form-data; boundary=..." automatically
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