import axios from "axios";

const usersApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/users",
});


export default usersApi;
