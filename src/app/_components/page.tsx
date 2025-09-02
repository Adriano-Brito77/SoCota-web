"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";


const schema = z.object({
  email: z.string().email("Email invalido.").min(1, "Email é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type LoginFormData = z.infer<typeof schema>;

export  function Login() {

  const { 
    signIn,
    isLoading
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

 


  const onSubmit = (data: LoginFormData) => {
    signIn(data);
  };

  return (
    <main className="flex items-center justify-center w-full h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-100 h-100">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg h-fit flex flex-col gap-6"
        >
          <label className="h-20 flex flex-col gap-1">
            Email:
            <input
              {...register("email")}
              placeholder="Email"
              className="border-1 border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </label>
          <label className="h-20 flex flex-col gap-1">
            Senha:
            <input
              {...register("password")}
              type="password"
              placeholder="Senha"
              className="border-1 border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-400 text-sm ">{errors.password.message}</p>
            )}
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2  rounded hover:bg-blue-600 transition-colors duration-200"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
