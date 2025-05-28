import { AppError } from "@/errors/app-error";
import axios from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const cookies = parseCookies();
  const token = cookies["access_token"];

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if (error.response && error.response.data?.message) {
      return Promise.reject(new AppError(error.response.data.message));
    } else {
      return Promise.reject(
        new AppError("Erro inesperado, tente novamente em alguns instantes.")
      );
    }
  }
);
