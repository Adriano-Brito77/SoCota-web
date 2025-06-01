"use client";
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
import { useMutation, useQuery } from "@tanstack/react-query";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SelectQuotationSupllier } from "./select-supliers-quotation";
import axios from "axios";
import { DatePicker } from "./calender-quotation";
import { SelectQuotationCompany } from "./select-company-quotation";
import { SelectQuotationProfit } from "./select-profit-quotation";

interface DialogProps {
  getSuppliers?: () => void;
}

export interface ProductPrice {
  id: string;
  suppliersName: string;
  suppliersId: string;
  priceCatalogName: string;
  productName: string;
  referenceContent: string;
  usdFobPrice: number;
  deliveryStart: Date;
  deliveryEnd: Date;
  financialDueDate: Date;
  userId: string;
}

export interface Supplier {
  id: string;
  name: string;
  finance_rate_before_date: number;
  finance_rate_after_date: number;
}
export interface Profit {
  id: string;
  company_id: string;
  profit_amount: number;
}

export function DialogCreateQuotation(getSupppliers: DialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dolar, setDolar] = useState("");
  const [company, setCompany] = useState("");
  const [supplier, setSupplier] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  const [open, setOpen] = useState(false);
  const [productquotation, setProduct] = useState({
    id: "",
    name: "",
    price: 0,
  });

  const { data: products } = useQuery<ProductPrice[]>({
    queryKey: ["products", supplier],
    queryFn: async () => {
      const response = await api.get(`/excel/allproducts/${supplier}`);
      return response.data;
    },
  });

  const suppliers = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await api.get("suppliers/allsuppliers");
      return response.data;
    },
  });
  const companys = useQuery<Supplier[]>({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await api.get("companies/allcompanies");
      return response.data;
    },
  });
  const profit = useQuery<Profit[]>({
    queryKey: ["profit", companys],
    queryFn: async () => {
      const response = await api.get(`/companies/allprofit/${company}`);
      console.log(response.data);
      return response.data;
    },
  });

  //Caso queira buscar a contação atual no horario atual
  const fetchDolar = async () => {
    try {
      const response = await axios.get(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL"
      );
      const bid = response.data?.USDBRL?.bid;
      if (bid) {
        setDolar(Number(bid).toFixed(2));
      }
    } catch (error) {
      console.error("Erro ao buscar cotação do dólar:", error);
      setDolar("");
    }
  };

  const handleDolar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDolar(e.target.value);
  };

  //   const mutation = useMutation({
  //     mutationFn: async (data: Supplier) => {
  //       const res = await api.post("suppliers/", data);

  //       return res.data;
  //     },
  //     onSuccess: (data) => {
  //       toast.success("Fornecedor criado com sucesso!");
  //       getSupppliers.getSuppliers?.();

  //       setOpen(false);
  //       setSupplier((prev) => ({
  //         ...prev,
  //         name: "",
  //         finance_rate_before_date: 0,
  //         finance_rate_after_date: 0,
  //       }));
  //     },
  //     onError: (error: AppError) => {
  //       toast.error(error.message || "Erro ao realizar login.");
  //     },
  //   });

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(e) => {
          setOpen(e), setProduct({ id: "", name: "", price: 0 });
        }}
      >
        <DialogTrigger asChild>
          <div className="flex">
            <Button className="bg-blue-500 w-[200px] h-full p-2 hover:bg-blue-700 text-amber-50 rounded-sm font-semibold ">
              Incluir Cotação
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent className="min-w-[50%]">
          <DialogHeader>
            <DialogTitle>Crie uma Cotação</DialogTitle>
          </DialogHeader>
          <Label className="flex-col">
            <div className="w-full">
              <span className="flex items-start w-full">Fornecedor:</span>
            </div>
            <SelectQuotationSupllier
              data={suppliers.data ?? []}
              onChange={setSupplier}
            />
          </Label>
          <Label className="flex-col">
            <div className="w-full">
              <span className="flex items-start w-full">Produto:</span>
            </div>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between text-zinc-500 "
                >
                  {!products
                    ? "Selecione um fornecedor para carregar os produtos."
                    : productquotation
                    ? products.find(
                        (framework) =>
                          framework.productName === productquotation.name
                      )?.productName
                    : "Selecione um produto"}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-full shrink-0 opacity-50 " />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput />
                  <CommandList>
                    <CommandEmpty>Produtos não encontrado.</CommandEmpty>
                    <CommandGroup>
                      {products?.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.productName}
                          onSelect={(currentValue) => {
                            setProduct({
                              id: product.id,
                              name: product.productName,
                              price: product.usdFobPrice, // ajuste conforme o nome correto do campo
                            });
                            setOpenPopover(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-full",
                              productquotation.id === product.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />

                          {product.productName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Label>
          <div>
            <div className="grid grid-cols-3 gap-2">
              <Label
                htmlFor="finance_rate"
                className="w-full mt-4 flex-col gap-2"
              >
                <span className="flex w-full ">Valor em dolar US$:</span>
                <Input
                  id="finance_rate"
                  name="finance_rate"
                  value={`${productquotation.price}`}
                  disabled
                  type="text"
                  min={0}
                />
              </Label>
              <Label
                htmlFor="finance_rate"
                className="w-full mt-4 flex-col gap-2"
              >
                <span className="flex w-full ">Empresa:</span>
                <SelectQuotationCompany
                  data={companys.data ?? []}
                  onChange={setCompany}
                />
              </Label>
              <Label
                htmlFor="finance_rate"
                className="w-full mt-4 flex-col gap-2"
              >
                <span className="flex w-full ">Margin:</span>
                <SelectQuotationProfit
                  data={profit.data ?? []}
                  onChange={setCompany}
                />
              </Label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Label htmlFor="finance_rate" className="w-full mt-4 items-end">
                <div className="w-full flex-col ">
                  <span className="flex w-full mb-2">Cotação atual:</span>
                  <Input
                    id="finance_rate"
                    name="finance_rate"
                    value={dolar}
                    type="text"
                    min={0}
                    onChange={handleDolar}
                  />
                </div>
                <Button
                  onClick={fetchDolar}
                  className="bg-zinc-100 hover:bg-zinc-300 text-black"
                >
                  Buscar
                </Button>
              </Label>

              <Label
                htmlFor="finance_rate"
                className="w-full mt-4 flex-col gap-2"
              >
                <span className="flex w-full ">Valor do frete:</span>
                <Input
                  id="finance_rate"
                  name="finance_rate"
                  value={`${productquotation.price}`}
                  disabled
                  type="text"
                  min={0}
                />
              </Label>

              <Label
                htmlFor="finance_rate"
                className="w-full mt-4 flex-col gap-2"
              >
                <span className="flex w-full ">Data de pagamento:</span>
                <DatePicker onChange={setDate} />
              </Label>
            </div>
          </div>
          <DialogFooter className="sm:justify-between mt-2">
            <Button className="bg-zinc-100 hover:bg-zinc-300 text-black">
              Criar cotação
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
