"use client";
import { useState } from "react";
import { Router, Trash } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Label } from "@/components/ui/label";
import { Input } from "./input";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { AppError } from "@/errors/app-error";
import { toast } from "react-toastify";
import { totalmem } from "os";

export interface company {
  id?: string;
  name: string;
  finance_rate: number;
  profit_amount: number[];
}

export function DialogCreateCompany({ refresh }: { refresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [newMargin, setNewMargin] = useState(""); // input temporário para nova margem
  const [company, setCompany] = useState<company>({
    name: "",
    finance_rate: 0,
    profit_amount: [],
  });

  const handleChangeCompany = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompany((prev) => ({
      ...prev,
      [name]: name === "finance_rate" ? Number(value) : value,
    }));
  };

  const handleAddMargin = () => {
    const parsed = Number(newMargin);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      return toast.error("Valor inválido.");
    }

    if (!isNaN(parsed)) {
      setCompany((prev) => ({
        ...prev,
        profit_amount: [...prev.profit_amount, parsed],
      }));
      setNewMargin("");
    }
  };

  const handleMarginChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedMargins = [...company.profit_amount];
      updatedMargins[index] = Number(e.target.value);
      setCompany((prev) => ({
        ...prev,
        profit_amount: updatedMargins,
      }));
    };

  const handleRemoveMargin = (index: number) => {
    const updatedMargins = company.profit_amount.filter((_, i) => i !== index);
    setCompany((prev) => ({
      ...prev,
      profit_amount: updatedMargins,
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data: company) => {
      const res = await api.post("companies", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Empresa Criada com sucesso.");
      setCompany({
        name: "",
        finance_rate: 0,
        profit_amount: [],
      });
      setNewMargin("");
      refresh();
    },
    onError: (error: AppError) => {
      toast.error(error.message || "Erro ao criar empresa.");
    },
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 w-[200px] p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold">
            Criar empresa
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md w-[80%]">
          <DialogHeader>
            <DialogTitle>Crie uma empresa</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="name" className="w-full flex-col">
              <div className="flex w-full">Nome:</div>
              <Input
                id="name"
                name="name"
                type="text"
                value={company.name}
                onChange={handleChangeCompany}
              />
            </Label>

            <Label htmlFor="finance_rate" className="w-full flex-col">
              <div className="flex w-full">Financeiro de ida:</div>
              <Input
                id="finance_rate"
                name="finance_rate"
                type="number"
                min={0}
                value={company.finance_rate}
                onChange={handleChangeCompany}
              />
            </Label>

            <Label className="w-full flex-col gap-2">
              <div className="flex w-full">Adicionar margem:</div>
              <div className="flex gap-2 w-full">
                <Input
                  className="w-full"
                  type="number"
                  min={0}
                  max={100}
                  value={newMargin}
                  onChange={(e) => setNewMargin(e.target.value)}
                />
                <Button
                  className="bg-blue-500 w-[150px] h-full p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold"
                  onClick={handleAddMargin}
                >
                  Adicionar
                </Button>
              </div>
            </Label>

            {company.profit_amount.length > 0 && (
              <div className="flex flex-col w-full gap-2">
                {company.profit_amount.map((margin, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={margin}
                      onChange={handleMarginChange(index)}
                      className="w-full"
                    />

                    <Trash
                      size={16}
                      onClick={() => handleRemoveMargin(index)}
                      className="text-red-500 hover:text-red-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between mt-2">
            <Button
              onClick={() => mutation.mutate(company)}
              className="bg-zinc-100 hover:bg-zinc-300 text-black"
            >
              Criar
            </Button>
            <DialogClose asChild>
              <Button
                className="bg-zinc-100 hover:bg-zinc-300 text-black"
                type="button"
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
