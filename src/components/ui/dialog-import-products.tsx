import { useState } from "react";
import { z } from "zod";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectDemo, Suppliers } from "./select-supliers";
import { api } from "@/utils/api";

export interface SupliersPagination {
  data?: Suppliers[];
  getProducts?: () => void;
}

export function DialogCloseButton({ data, getProducts }: SupliersPagination) {
  const [open, setOpen] = useState(false);
  const [idSupplier, setIdSupplier] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const spreadsheetMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ];

  // Zod schema para validar o arquivo
  const fileSchema = z.custom<File>(
    (file) => file instanceof File && spreadsheetMimeTypes.includes(file.type),
    {
      message: "Selecione um arquivo .",
    }
  );

  const formSchema = z.object({
    file: fileSchema,
    id: z.string().min(1, "Fornecedor obrigatório."),
  });

  const switchSupliers = (selectedId: string) => {
    setIdSupplier(selectedId);
  };

  const importProducts = async ({ file, id }: { file: File; id: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);

    try {
      const response = await api.post("/excel/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        response.data.message || "Importação realizada com sucesso!"
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao importar planilha.";
      toast.error(message);
    }
  };

  const handleImport = async () => {
    const result = formSchema.safeParse({ file, id: idSupplier });

    if (!result.success) {
      const error = result.error.format();
      if (error.file?._errors?.[0]) {
        toast.error(error.file._errors[0]);
      } else if (error.id?._errors?.[0]) {
        toast.error(error.id._errors[0]);
      }
      return;
    }

    setIsLoading(true); // <-- Começa o loading
    try {
      await importProducts({ file: result.data.file, id: result.data.id });
      await getProducts?.();
      setOpen(false);
    } catch (err) {
      // Erros já tratados dentro do importProducts (com toast)
    } finally {
      setIsLoading(false); // <-- Finaliza o loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex">
          <Button className="bg-blue-500 w-[200px] h-full p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold ">
            Importar Produtos
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importação de Produto</DialogTitle>
          <DialogDescription>
            Selecione a planilha de produtos e o fornecedor correspondente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <Label htmlFor="file" className="w-full flex-col">
            <div className="flex w-full">Arquivo:</div>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) setFile(selectedFile);
              }}
            />
          </Label>

          <Label className="w-full flex-col">
            <div className="flex w-full">Fornecedor:</div>
            <SelectDemo data={data} Supplier={switchSupliers} />
          </Label>
        </div>

        <DialogFooter className="sm:justify-between mt-2">
          <Button
            className="bg-zinc-100 hover:bg-zinc-300 text-black"
            onClick={handleImport}
            disabled={isLoading}
          >
            {isLoading ? "Importando..." : "Importar"}
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
