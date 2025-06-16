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

import { CheckIcon, ChevronsUpDownIcon, Trash } from "lucide-react";

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
import { Half1Icon } from "@radix-ui/react-icons";
import { format, formatDate, parse, parseISO } from "date-fns";

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
interface Quotation {
  company_id: string;
  product: { id: string; name: string; price: number };
  dollar_rate: number;
  delivery_fee: number;
  payment_date: string;
  profit_margin_id: string;
  supplier_id: string;
  has_credit: boolean;
}
interface QuotationNew {
  name: string;
  data_cliente: string;
  company_id: string;
  product_id: string;
  dollar_rate: number;
  delivery_fee: number;
  payment_date: string;
  profit_margin_id: string;
  supplier_id: string;
  has_credit: boolean;
}

type Quotations = QuotationNew[];

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
  const dateActual = new Date();
  const [date, setDate] = useState<string>(format(dateActual, "yyyy/MM/dd"));
  const [dolar, setDolar] = useState<string>("");
  const [company, setCompany] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<string>("");
  const [supplier, setSupplier] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasCredit, setHasCredit] = useState(false);
  const [productquotation, setProduct] = useState({
    id: "",
    name: "",
    price: 0,
  });
  const [quotations, setQuotations] = useState<Quotations>([]);

  const [Quotation, setQuotation] = useState<Quotation>({
    company_id: "",
    product: { id: "", name: "", price: 0 },
    dollar_rate: 0,
    delivery_fee: 0,
    payment_date: date,
    profit_margin_id: "",
    supplier_id: "",
    has_credit: hasCredit,
  });

  const { data: products } = useQuery<ProductPrice[]>({
    queryKey: ["products", supplier],
    queryFn: async () => {
      const response = await api.get(`/excel/allproducts/${supplier}`);
      setProduct({ id: "", name: "", price: 0 });
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
    queryKey: ["profit", companys, company],
    queryFn: async () => {
      const response = await api.get(`/companies/allprofit/${company}`);
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

  const handleRemoveQuotation = (index: number) => {
    setQuotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!supplier) {
      toast.error("Preencha o campo fornecedor");
      return;
    }

    if (productquotation.id === "") {
      toast.error("Selecione um produto");
      return;
    }
    if (!company) {
      toast.error("Preencha o campo empresa");
      return;
    }
    if (!profitMargin) {
      toast.error("Preencha o campo margin");
      return;
    }
    if (Number(dolar) < 0 || Number(dolar) == 0) {
      toast.error("O valor do dolar dever ser maior que zero");
      return;
    }
    if (Number(deliveryFee) < 0 || Number(deliveryFee) == 0) {
      toast.error(
        "O valor do frete dever ser maior que zero e não deve estar em branco"
      );
      return;
    }

    const newQuotation: QuotationNew = {
      data_cliente: format(date, "dd/MM/yyyy"),
      name: productquotation.name,
      company_id: company,
      product_id: productquotation.id,
      dollar_rate: Number(dolar),
      delivery_fee: Number(deliveryFee),
      payment_date: date,
      profit_margin_id: profitMargin,
      supplier_id: supplier,
      has_credit: hasCredit,
    };

    // Atualiza o estado do objeto individual (se quiser manter)
    ///setQuotation({});

    // Adiciona no array de quotations
    setQuotations((prev) => [...prev, newQuotation]);

    //Se quiser, limpa campos aqui depois do submit

    setDolar("");
    setDeliveryFee("");
    setDate(format(dateActual, "dd/MM/yyyy"));

    setHasCredit(false);
  };

  const mutation = useMutation({
    mutationFn: async (data: Quotations) => {
      const res = await api.post("quotations/", quotations);

      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.message}`);
      getSupppliers.getSuppliers?.();
      getSupppliers;
      setQuotations([]);
      setOpen(false);
    },
    onError: (error: AppError) => {
      toast.error(error.message || "Erro ao realizar login.");
    },
  });

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
                              price: product.usdFobPrice,
                            });
                            setOpenPopover(false);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-full",
                              productquotation.id === product.id
                                ? "opacity-100 re"
                                : "opacity-0"
                            )}
                          />

                          <div className="grid grid-cols-[2fr_1fr_2fr] w-full">
                            <span className="truncate w-[70%]">
                              {product.priceCatalogName}
                            </span>
                            <span className="truncate  w-[80%]">
                              {product.financialDueDate
                                ? format(
                                    new Date(product.financialDueDate),
                                    "dd/MM/yyyy"
                                  )
                                : "Data não informada"}
                            </span>
                            <span className="truncate  w-[80%]">
                              {product.productName}
                            </span>
                          </div>
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
                  onChange={setProfitMargin}
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
                    type="number"
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
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  autoComplete="off"
                  type="number"
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

            <div className="flex mt-2 font-medium">
              <div className="mr-2">
                <span className="">Possui credito:</span>
              </div>
              <input
                className="w-5 h-5 bg-zinc-100 hover:bg-red-500 text-red "
                id="has_credit"
                name="hasCredit"
                type="checkbox"
                onChange={(e) => setHasCredit(e.target.checked)}
                min={0}
              />
            </div>

            <div className="mt-2 gap-2 border rounded-2xl p-4 grid grid-cols-2 max-h-[60%]  overflow-auto">
              {quotations.length > 0 ? (
                quotations.map((quotation, index) => (
                  <span
                    key={index}
                    className="border rounded-2xl p-4 gap-4 flex "
                  >
                    <div className="grid grid-cols-2 gap-4 h-fit">
                      <Label>
                        Produto:
                        <p className="truncate w-30">{quotation.name}</p>
                      </Label>
                      <Label>
                        Dolar US$:
                        <p>{quotation.dollar_rate}</p>
                      </Label>
                      <Label>
                        Frete R$:
                        <p>{quotation.delivery_fee}</p>
                      </Label>
                      <Label>
                        Possui Crédito:
                        <p>{quotation.has_credit ? "Sim" : "Não"}</p>
                      </Label>
                      <Label>
                        Pagamento:
                        <p>{quotation.data_cliente}</p>
                      </Label>
                    </div>

                    <div
                      className="flex items-center"
                      onClick={() => handleRemoveQuotation(index)}
                    >
                      <Trash className="text-red-500 hover:text-red-300" />
                    </div>
                  </span>
                ))
              ) : (
                <div>
                  <h1>Não há cotações</h1>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-between mt-2">
            <div className="flex gap-4">
              <Button
                className="bg-blue-500 hover:bg-blue-500 text-white"
                onClick={handleSubmit}
              >
                Incluir cotação
              </Button>
              <Button
                className="bg-zinc-100 hover:bg-zinc-300 text-black"
                onClick={() => mutation.mutate(quotations)}
              >
                Criar cotação
              </Button>
            </div>
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
