import { Trash, Pencil } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { AppError } from "@/errors/app-error";
import { Companies, profitMargins } from "@/app/companies/page";

interface Edit {
  refresh?: () => void;
  company: Companies;
}

export function DialogEditCompany({ company, refresh }: Edit) {
  const [open, setOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Companies>(company);
  const [newMargin, setNewMargin] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditCompany((prev) => ({
      ...prev,
      [name]: name === "finance_rate" ? Number(value) : value,
    }));
  };

  const handleMarginChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedMargins = [...editCompany.profit_margins];
      updatedMargins[index] = {
        ...updatedMargins[index],
        profit_amount: Number(e.target.value),
      };
      setEditCompany((prev) => ({
        ...prev,
        profit_margins: updatedMargins,
      }));
    };

  const handleRemoveMargin = (index: number) => {
    const updatedMargins = editCompany.profit_margins.filter(
      (_, i) => i !== index
    );
    setEditCompany((prev) => ({
      ...prev,
      profit_margins: updatedMargins,
    }));
  };

  const handleAddMargin = () => {
    const parsed = Number(newMargin);
    if (editCompany.profit_margins.some((m) => m.profit_amount === parsed)) {
      return toast.error("Margem ja utilizada.");
    }

    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      setEditCompany((prev) => ({
        ...prev,
        profit_margins: [
          ...prev.profit_margins,
          {
            id: crypto.randomUUID(),
            profit_amount: parsed,
          },
        ],
      }));
      setNewMargin("");
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: Companies) => {
      // Monta o payload no formato esperado pela API
      const payload = {
        name: data.name,
        finance_rate: data.finance_rate,
        profit_margins: data.profit_margins.map((m) => m.profit_amount),
      };
      const res = await api.patch(`/companies/${data.id}`, payload);
      return res.data;
    },
    onSuccess: async () => {
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

  console.log(editCompany);

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
            <Label htmlFor="name" className="w-full flex-col gap-2">
              <span className="flex w-full mt-4">Fornecedor:</span>
              <Input
                id="name"
                name="name"
                value={editCompany.name}
                type="text"
                spellCheck={false}
                onChange={handleChange}
              />
            </Label>
            <Label htmlFor="finance_rate" className="w-full flex-col gap-2">
              <span className="flex w-full mt-4">Financeiro:</span>
              <Input
                id="finance_rate"
                name="finance_rate"
                value={editCompany.finance_rate}
                type="number"
                min={0}
                onChange={handleChange}
              />
            </Label>

            <Label className="w-full flex-col gap-2 mt-2">
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

            <Label htmlFor="profit_margins" className="w-full flex-col gap-4">
              <span className="flex w-full mt-4">Editar Margens:</span>
              {editCompany.profit_margins.map((e, idx) => (
                <div
                  key={e.id}
                  className="flex justify-between w-full items-center gap-2"
                >
                  <Input
                    value={e.profit_amount}
                    type="number"
                    onChange={handleMarginChange(idx)}
                    min={0}
                  />
                  <Trash
                    size={16}
                    className="text-red-500 hover:text-red-300"
                    onClick={() => handleRemoveMargin(idx)}
                  />
                </div>
              ))}
            </Label>
          </div>
          <DialogFooter className="sm:justify-between mt-2">
            <Button
              className="bg-zinc-100 hover:bg-zinc-300 text-black"
              onClick={() => mutation.mutate(editCompany)}
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
