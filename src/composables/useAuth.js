/*import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import backendApi from "@/services/backendApi.js";

const userApiEndpoint = import.meta.env.VITE_BACKEND_USER_API_ENDPOINT || "/userInfo";
const refreshTokenEndpoint = import.meta.env.VITE_BACKEND_REFRESH_TOKEN_ENDPOINT || "/auth/refresh";

const useAuth = () => {
  const authStore = useAuthStore();
  const { accessToken, refreshToken, user, isLoggedIn } = storeToRefs(authStore);
  const router = useRouter();

  // Obtener info del usuario
  const getUserInfo = async () => {
    try {
      const { data } = await backendApi.post(userApiEndpoint, null, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });
      user.value = data.user || data.data.user;
      isLoggedIn.value = true;
    } catch (error) {
      console.error("Error al obtener info de usuario:", error);
      logout();
    }
  };

  // Refrescar token
  const refreshAccessToken = async () => {
    try {
      const { data } = await axios.post(refreshTokenEndpoint, null, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });

      accessToken.value = data.data?.access_token || data.access_token;
      refreshToken.value = data.data?.refresh_token || data.refresh_token || "";
      localStorage.setItem("access_token", accessToken.value);
      localStorage.setItem("refresh_token", refreshToken.value);

      return data;
    } catch (error) {
      console.error("Error refrescando token:", error);
      logout();
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    isLoggedIn.value = false;
    user.value = null;
    router.push("/login");
  };

  // Login
  const login = async (credentials) => {
    try {
      const { data } = await backendApi.post("/auth/login", credentials);

      // Ajustado según la respuesta real de tu backend
      const tokenData = data.data;

      localStorage.setItem("access_token", tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token || "");
      localStorage.setItem("user", JSON.stringify(tokenData.user));

      user.value = tokenData.user;
      isLoggedIn.value = true;
    } catch (error) {
      console.error("Error en login:", error);
      throw new Error(error.response?.data?.message || error.message || "Error desconocido");
    }
  };

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    login,
    getUserInfo,
    refreshAccessToken,
    logout,
  };
};

export default useAuth;
*/

//Codigo Originañ
import axios from "axios";

import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import backendApi from "@/services/backendApi.js"

const userApiEndpoint = import.meta.env.VITE_BACKEND_USER_API_ENDPOINT;
const refreshTokenEndpoint = import.meta.env.VITE_BACKEND_REFRESH_TOKEN_ENDPOINT;

const useAuth = () => {
  const authStore = useAuthStore();
  const {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
  } = storeToRefs(authStore);
  const router = useRouter();

  const getUserInfo = async () => {
    const { data } = await backendApi
      .post(userApiEndpoint, null, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });

    user.value = data.user;
    isLoggedIn.value = true;
  };

  const refreshAccessToken = async () => {
    const response = await axios
      .post(refreshTokenEndpoint, null, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      .catch((error) => {
        console.log(error);
        logout();
      });

    accessToken.value = response.data.access_token;
    refreshToken.value = response.data.refresh_token;

    return response;
  };

  const logout = () => {
    localStorage.clear();
    isLoggedIn.value = false;
    router.push("/login");
  };

  const login = async (credentials) => {
    const { data } = await backendApi.post('/auth/login', credentials)

    localStorage.setItem('access_token', data.data.backend.access_token)
    localStorage.setItem('refresh_token', data.data.backend.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.data.user))

    user.value = data.data.user;
    isLoggedIn.value = true;
  }

  return {
    // Variables
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    // Functions
    login,
    getUserInfo,
    refreshAccessToken,
    logout,
  };
};

export default useAuth;
