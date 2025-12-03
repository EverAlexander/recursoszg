import axios from "axios";

const consolaApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/Consola",
});

export default consolaApi;

//The vr
