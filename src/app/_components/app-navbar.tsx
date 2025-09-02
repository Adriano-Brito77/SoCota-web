"use client";

import { useAuth } from "@/hooks/useAuth";
export function NavBar() {
  const { user } = useAuth();

  return (
    <div className=" flex items-center justify-end bg-zinc-100 text-black p-4">
      <div className="flex justify-end">
        <h1 className="text-xl font-bold">{user?.name}</h1>
      </div>
    </div>
  );
}
