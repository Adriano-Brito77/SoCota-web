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
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { AppError } from "@/errors/app-error";
import { Companies } from "@/app/companies/page";

interface Edit {
  refresh?: () => void;
  company: Companies;
}

export function DialogEditCompany({ company, refresh }: Edit) {
  const [open, setOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Companies>({
    ...company,
    profit_margins: company.profit_margins ?? [],
  });
  const [newMargin, setNewMargin] = useState("");

  // 🔹 Sempre que abrir para outra empresa, sincroniza os dados
  useEffect(() => {
    setEditCompany({
      ...company,
      profit_margins: company.profit_margins ?? [],
    });
    setNewMargin("");
  }, [company]);

  // 🔹 Atualiza os campos simples (nome e taxa financeira)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditCompany((prev) => ({
      ...prev,
      [name]: name === "finance_rate" ? Number(value) : value,
    }));
  };

  // 🔹 Atualiza um valor de margem específica
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

  // 🔹 Remove margem pelo índice
  const handleRemoveMargin = (index: number) => {
    const updatedMargins = editCompany.profit_margins.filter(
      (_, i) => i !== index
    );
    setEditCompany((prev) => ({
      ...prev,
      profit_margins: updatedMargins,
    }));
  };

  // 🔹 Adiciona nova margem com validação
  const handleAddMargin = () => {
    const parsed = Number(newMargin);

    if (isNaN(parsed) || parsed <= 0 || parsed > 100) {
      return toast.error("Informe uma margem válida entre 1 e 100.");
    }

    if (editCompany.profit_margins.some((m) => m.profit_amount === parsed)) {
      return toast.error("Essa margem já foi adicionada.");
    }

    setEditCompany((prev) => ({
      ...prev,
      profit_margins: [
        ...prev.profit_margins,
        { id: crypto.randomUUID(), profit_amount: parsed },
      ],
    }));
    setNewMargin("");
  };

  // 🔹 Validações antes do envio
  const validateForm = (): boolean => {
    if (!editCompany.name.trim()) {
      toast.error("O nome do fornecedor é obrigatório.");
      return false;
    }
    if (editCompany.finance_rate < 0) {
      toast.error("A taxa financeira não pode ser negativa.");
      return false;
    }
    return true;
  };

  // 🔹 Mutação para edição do fornecedor
  const mutation = useMutation({
    mutationFn: async (data: Companies) => {
      const payload = {
        name: data.name,
        finance_rate: data.finance_rate,
        profit_amount: data.profit_margins.map((m) => m.profit_amount),
      };

      const res = await api.patch(`/companies/${data.id}`, payload);
      return res.data;
    },
    onSuccess: async () => {
      refresh?.();
      toast.success("Fornecedor atualizado com sucesso!");
      setOpen(false);
      setNewMargin("");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AppError ? error.message : "Erro ao realizar edição.";
      toast.error(errorMessage);
    },
  });

  // 🔹 Submete edição com validação
  const handleEdit = () => {
    if (!validateForm()) return;
    mutation.mutate(editCompany);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pencil className="size-4 hover:text-gray-400 cursor-pointer" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="flex-col items-center h-full">
          {/* Nome */}
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

          {/* Taxa financeira */}
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

          {/* Adicionar nova margem */}
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
                className="bg-blue-500 w-[150px] h-full p-2 hover:bg-blue-700 text-white rounded-sm font-semibold"
                onClick={handleAddMargin}
              >
                Adicionar
              </Button>
            </div>
          </Label>

          {/* Editar margens existentes */}
          <Label htmlFor="profit_margins" className="w-full flex-col gap-4">
            <span className="flex w-full mt-4">Editar Margens:</span>
            {editCompany.profit_margins.map((m, idx) => (
              <div
                key={m.id}
                className="flex justify-between w-full items-center gap-2"
              >
                <Input
                  value={m.profit_amount}
                  type="number"
                  onChange={handleMarginChange(idx)}
                  min={0}
                />
                <Trash
                  size={16}
                  className="text-red-500 hover:text-red-300 cursor-pointer"
                  onClick={() => handleRemoveMargin(idx)}
                />
              </div>
            ))}
          </Label>
        </div>

        <DialogFooter className="sm:justify-between mt-2">
          <Button
            className="bg-zinc-100 hover:bg-zinc-300 text-black"
            onClick={handleEdit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Editar"}
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
  );
}
