"use client";
import { Trash, Pencil } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Supplier } from "@/app/suppliers/page";

interface dataProps {
  data: Supplier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface Edit {
  edit?: () => void;
  id: string;
  name?: string;
}

export function DialogEdit({ id, nameLabel, supplier, edit }: Edit) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex gap-8">
            <Pencil className="size-4 hover:text-gray-400" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar </DialogTitle>
          </DialogHeader>

          <div className="flex-col items-center"></div>
          <DialogFooter className="sm:justify-between mt-2">
            <Button className="bg-zinc-100 hover:bg-zinc-300 text-black">
              Editar
            </Button>

            <DialogClose asChild>
              <Button
                className="bg-zinc-100 hover:bg-zinc-300 text-black"
                type="button"
                variant="secondary"
              >
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
