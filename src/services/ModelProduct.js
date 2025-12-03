import axios from "axios";

const modelo = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/modelProduct",
});


export default modelo;

//Prueba 02
