'use client'

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { UseMutateFunction, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "@/utils/api";
import { AppError } from "@/errors/app-error";

interface User {
  id?: string;
  name?: string;
  email: string;
}

interface SignInProps {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  user: User;
}

interface AuthContextProps {
  signIn: UseMutateFunction<SignInResponse, AppError, SignInProps>;
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { push } = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function signInRequest({ email, password }: SignInProps) {
    const response = await api.post<SignInResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  const { mutate, isPending } = useMutation<SignInResponse, AppError, SignInProps>(
  
    {
      mutationFn: signInRequest,
      onSuccess: (data) => {
        setUser(data.user);
        setCookie(undefined, "access_token", data.token, {
          maxAge: 60 * 60 * 24 * 180,
          path: "/",
        });

        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setIsAuthenticated(true);
        push("/quotation");
        toast.success("Login realizado com sucesso");
      },
      onError: (error: AppError) => {
        toast.error(error.message || "Erro ao realizar login");
      },
    }
  );

  function signOut() {
    destroyCookie(undefined, "access_token");
    setUser(null);
    setIsAuthenticated(false);
    push("/");
  }

  // Verifica token salvo no cookie
  useEffect(() => {
    const { access_token } = parseCookies();
    if (access_token) {
      api.defaults.headers.Authorization = `Bearer ${access_token}`;
      setIsAuthenticated(true);

      // 🔹 Opcional: podemos buscar os dados do usuário autenticado
      api.get<User>("/auth/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: mutate,
        isLoading: isPending,
        user,
        isAuthenticated,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
