import axios from "axios";

const controlsApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/controles",
});

export default controlsApi;
