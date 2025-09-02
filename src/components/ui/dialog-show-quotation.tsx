"use client";
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

export interface Quotation {
  id: string;
  product_id: string;
  products: { productName: string };
  suppliers: { name: string; finance_rate_before_date: number };
  dollar_rate: number;
  payment_date: string;
  price: number;
  delivery_fee: number | null;
  profit_margins: { profit_amount: number };
  companies: { finance_rate: number };
}

interface DialogShowQuotationProps {
  quotation: Quotation[];
  
}

export function DialogShowQuotation({ quotation,  }: DialogShowQuotationProps) {
  const [open, setOpen] = useState(false);

  // Agrupa por product_id
  const grouped = quotation.reduce<Record<string, Quotation[]>>((acc, item) => {
    if (!acc[item.product_id]) acc[item.product_id] = [];
    acc[item.product_id].push(item);
    return acc;
  }, {});

  // Ordena cada grupo pelo payment_date
  const organized = Object.entries(grouped).map(([product_id, items]) => {
    const sorted = items.sort(
      (a, b) =>
        new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
    return {
      product_id,
      productName: sorted[0].products.productName, // pega o nome do produto
      payments: sorted,
    };
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex">
            <Button
              className="bg-blue-500 w-[200px] h-full p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold"
              
            >
              Mostrar cotações
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent className="w-4xl">
          <DialogHeader>
            <DialogTitle className="font-semibold gap-2 mb-2 text-lg">
              Cotações
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {organized.map((group) => (
              <div key={group.product_id} className="border p-2 rounded">
                <h3 className="font-bold gap-2 mb-2 text-lg">
                  {group.productName}
                </h3>
                {group.payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span>Fornecedor: {p.suppliers.name}</span>
                    <span>
                      Data pagamento:{" "}
                      {new Date(p.payment_date).toLocaleDateString("pt-BR")}
                    </span>
                    <span>
                      Valor: $
                      {p.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <DialogFooter className="sm:justify-between mt-2">
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
