import axios from "axios";

const brandsApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/brands",
});


export default brandsApi;
