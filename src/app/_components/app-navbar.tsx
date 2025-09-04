"use client";

import { UserDropdown } from "./droppDown";
export function NavBar() {
 

  return (
    <div className=" flex items-center justify-end bg-zinc-100 text-black p-2">
      <div className="flex justify-end">
       
        <UserDropdown />
      </div>
    </div>
  );
}
