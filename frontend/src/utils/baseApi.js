import axios from "axios";

export const baseApi = axios.create({
    baseURL: "http://localhost:8080/api", // backend base URL
    headers: {
        "Content-Type": "application/json",
    },
});


