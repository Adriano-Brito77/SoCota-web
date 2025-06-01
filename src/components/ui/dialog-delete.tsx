"use client";
import { Trash } from "lucide-react";
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

interface Props {
  id: string;
  name: string;
  title: string;
  onDelete: () => void;
}

export function DialogDelete({ id, name, title, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex gap-8">
            <Trash className="size-4 text-red-500 hover:text-red-300" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Deseja excluir {title} "{name}" ?
            </DialogTitle>
          </DialogHeader>

          <div className="flex-col items-center h-full"></div>
          <DialogFooter className="sm:justify-between mt-2">
            <Button
              className="bg-zinc-100 hover:bg-zinc-300 text-black"
              onClick={() => onDelete()}
            >
              Excluir
            </Button>

            <DialogClose asChild>
              <Button
                className="bg-zinc-100 hover:bg-zinc-300 text-black"
                type="button"
                variant="secondary"
              >
                Sair
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
