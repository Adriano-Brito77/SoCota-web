import { useState } from "react";
import { toast } from "react-toastify";
import { AppError } from "@/errors/app-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";

interface DialogProps {
  getSuppliers?: () => void;
}

interface Supplier {
  name: string;
  finance_rate_before_date: number;
  finance_rate_after_date: number;
}

export function DialogSuppliers(getSupppliers: DialogProps) {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>({
    name: "",
    finance_rate_before_date: 0,
    finance_rate_after_date: 0,
  });

  const mutation = useMutation({
    mutationFn: async (data: Supplier) => {
      const res = await api.post("suppliers/", data);

      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Fornecedor criado com sucesso!");
      getSupppliers.getSuppliers?.();

      setOpen(false);
      setSupplier((prev) => ({
        ...prev,
        name: "",
        finance_rate_before_date: 0,
        finance_rate_after_date: 0,
      }));
    },
    onError: (error: AppError) => {
      toast.error(error.message || "Erro ao realizar login.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      [name]: name.includes("finance_rate") ? Number(value) : value,
    }));
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex">
            <Button className="bg-blue-500 w-[200px] h-full p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold ">
              Incluir Fornecedor
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crie um Fornecedor</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="name" className="w-full flex-col">
              <div className="flex w-full">Nome:</div>
              <Input
                id="name"
                name="name"
                value={supplier.name}
                type="text"
                onChange={handleChange}
              />
            </Label>
            <Label
              htmlFor="finance_rate_before_date"
              className="w-full flex-col"
            >
              <div className="flex w-full">Financerio de ida:</div>
              <Input
                id="finance_rate_before_date"
                name="finance_rate_before_date"
                value={supplier.finance_rate_before_date}
                type="number"
                min={0}
                onChange={handleChange}
              />
            </Label>
            <Label
              htmlFor="finance_rate_after_date"
              className="w-full flex-col"
            >
              <div className="flex w-full">Financeiro de volta:</div>
              <Input
                id="finance_rate_after_date"
                name="finance_rate_after_date"
                value={supplier.finance_rate_after_date}
                type="number"
                min={0}
                onChange={handleChange}
              />
            </Label>
          </div>

          <DialogFooter className="sm:justify-between mt-2">
            <Button
              className="bg-zinc-100 hover:bg-zinc-300 text-black"
              onClick={() => mutation.mutate(supplier)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Criando..." : "Criar"}
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
