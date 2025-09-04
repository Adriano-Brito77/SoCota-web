'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/hooks/useAuth';
import { ChevronDown } from "lucide-react";


export function UserDropdown() {
  const { user, signOut } = useAuth()

  return (
    user?.name ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 font-semibold text-sm cursor-pointer hover:bg-zinc-300 px-3 py-1 rounded">
            <span>{user.name} </span>

            <ChevronDown size={20} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={5} >   
          
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            Sair da plataforma
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
        <Skeleton className="w-28 h-7 bg-zinc-300" />

    )
  )
}