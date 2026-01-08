import api from "./axiosClient";

const userApi = {
    // --- AUTHENTICATION ---

    // 1. Register
    // Backend: router.post("/register", ...)
    // URL: /api/user/register
    register: (data) => api.post("/user/register", data),

    // 2. Login
    // Backend: router.post("/login", ...)
    // URL: /api/user/login
    login: (data) => api.post("/user/login", data),

    // 3. Get Current User Profile
    // Backend: router.get("/profile", ...)
    // URL: /api/user/profile
    getMe: () => api.get("/user/profile"),


    // --- USER MANAGEMENT ---

    // 4. Get All Users (Admin)
    // Backend: router.get("/getUsers", ...)
    // URL: /api/user/getUsers
    getAll: (params) => api.get("/user/getUsers", { params }),

    // 5. Get Single User (Admin)
    // Backend: router.get("/getUser/:id", ...)
    // URL: /api/user/getUser/:id
    getById: (id) => api.get(`/user/getUser/${id}`),

    // 6. Update User
    // Backend: router.put("/updateUser/:id", ...)
    // URL: /api/user/updateUser/:id
    update: (id, data) => {
        const config = data instanceof FormData
            // FIX: Set Content-Type to undefined so the browser adds the boundary automatically
            ? { headers: { "Content-Type": undefined } }
            : {};

        return api.put(`/user/updateUser/${id}`, data, config);
    },

    // 7. Delete User (Admin)
    // Backend: router.delete("/deleteUser/:id", ...)
    // URL: /api/user/deleteUser/:id
    remove: (id) => api.delete(`/user/deleteUser/${id}`),
};

export default userApi;