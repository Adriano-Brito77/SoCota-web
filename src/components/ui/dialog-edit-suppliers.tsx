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
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { AppError } from "@/errors/app-error";

interface Edit {
  refresh?: () => void;
  supplier: Supplier;
}

export function DialogEdit({ supplier, refresh }: Edit) {
  const [open, setOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier>(supplier);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditSupplier((prev) => ({
      ...prev,
      [name]: name.includes("finance_rate") ? Number(value) : value,
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data: Supplier) => {
      const res = await api.patch(`/suppliers/${data.id}`, data);
      console.log("Login response:", res);

      return res.data;
    },
    onSuccess: async (data) => {
      await refresh?.();
      toast.success("Fornecedor atualizado com sucesso!");
      setOpen(false);
    },

    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AppError ? error.message : "Erro ao realizar Edição.";
      toast.error(errorMessage);
    },
  });

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
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>

          <div className="flex-col items-center h-full">
            <Label
              htmlFor="finance_rate_before_date"
              className="w-full flex-col gap-2"
            >
              <span className="flex w-full mt-4">Fornecedor:</span>
              <Input
                id="name"
                name="name"
                value={editSupplier.name}
                type="text"
                disabled
                spellCheck={false}
                onChange={handleChange}
              />
            </Label>
            <Label
              htmlFor="finance_rate_before_date"
              className="w-full flex-col gap-2"
            >
              <span className="flex w-full mt-4">Financerio de ida:</span>
              <Input
                id="finance_rate_before_date"
                name="finance_rate_before_date"
                value={editSupplier.finance_rate_before_date}
                type="number"
                min={0}
                onChange={handleChange}
              />
            </Label>
            <Label
              htmlFor="finance_rate_after_date"
              className="w-full flex-col gap-2"
            >
              <span className="flex w-full mt-4">Financeiro de volta:</span>
              <Input
                id="finance_rate_after_date"
                name="finance_rate_after_date"
                value={editSupplier.finance_rate_after_date}
                type="number"
                min={0}
                onChange={handleChange}
              />
            </Label>
          </div>
          <DialogFooter className="sm:justify-between mt-2">
            <Button
              onClick={() => mutation.mutate(editSupplier)}
              className="bg-zinc-100 hover:bg-zinc-300 text-black"
            >
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
