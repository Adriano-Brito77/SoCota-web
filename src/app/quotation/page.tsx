"use client";
import { columns } from "@/app/quotation/_components/table-column";
import { DialogCreateQuotation } from "@/components/ui/dialog-create-quotation";
import { DialogDelete } from "@/components/ui/dialog-delete";
import { DialogShowQuotation } from "@/components/ui/dialog-show-quotation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppError } from "@/errors/app-error";
import { api } from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

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

export interface QuotationProps {
  data: Quotation[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface PagesState {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function Quotation() {
  const [pages, setPages] = useState<PagesState>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 5,
  });

  // Agora armazenamos o objeto completo
  const [selectedItems, setSelectedItems] = useState<Quotation[]>([]);

  console.log("Selected Items:", selectedItems);
  const {
    isPending,
  
    refetch,
    data: quotations,
  } = useQuery<QuotationProps>({
    queryKey: ["quotations", pages.currentPage, pages.pageSize],
    queryFn: async () => {
      const response = await api.get("/quotations", {
        params: {
          page: pages.currentPage,
          pageSize: pages.pageSize,
          orderBy: "product_id,asc",
          search: "",
        },
      });
      setPages((prev: PagesState) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      }));
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Quotation) => {
      const res = await api.delete(`/quotations/${data.id}`);
      return res.data;
    },
    onSuccess: async () => {
      await refetch?.();
      toast.success("Cotação excluída com sucesso!");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AppError ? error.message : "Erro ao excluir cotação.";
      toast.error(errorMessage);
    },
  });

  const table = useReactTable({
    data: quotations?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Seleciona ou desmarca um item individual
  const handleSelect = (quotation: Quotation) => {
    setSelectedItems((prev) =>
      prev.find((item) => item.id === quotation.id)
        ? prev.filter((item) => item.id !== quotation.id)
        : [...prev, quotation]
    );
  };

  // Seleciona ou desmarca todos
  const handleSelectAll = () => {
    if (!quotations) return;
    if (selectedItems.length === quotations.data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(quotations.data);
    }
  };

  const nextPage = () => {
    setPages((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, pages.totalPages),
    }));
  };

  const decrementPage = () => {
    setPages((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  const firstPage = () => {
    setPages((prev) => ({ ...prev, currentPage: 1 }));
  };

  const lastPage = () => {
    setPages((prev) => ({ ...prev, currentPage: pages.totalPages }));
  };

  return (
    <div className="p-8 font-bold text-4xl h-full">
      <div className="flex justify-between  h-[10%]">
        <h1>Cotações</h1>
        <div className="flex flex-col gap-1 ">
          <DialogCreateQuotation getSuppliers={refetch} />
          {selectedItems.length >= 1 ? <DialogShowQuotation quotation={selectedItems} /> : null}
        </div>
      </div>

      <div className="mt-8 p-4 h-auto overflow-y-auto border-2 rounded-lg bg-white">
        {quotations && quotations.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {/* Checkbox para selecionar todos */}
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedItems.length === quotations.data.length}
                  />
                </TableHead>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead className="font-bold" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: columns.length + 1 }).map(
                        (_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                : quotations.data.map((data) => (
                    <TableRow className="font-medium" key={data.id}>
                      {/* Checkbox para selecionar individualmente */}
                      <TableCell>
                        <input
                          type="checkbox"
                          onChange={() => handleSelect(data)}
                          checked={selectedItems.some(
                            (item) => item.id === data.id
                          )}
                        />
                      </TableCell>

                      <TableCell>{data.products.productName}</TableCell>
                      <TableCell>{data.suppliers.name}</TableCell>
                      <TableCell>
                        {data.dollar_rate.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(data.payment_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {data.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        {data.delivery_fee?.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>{data.profit_margins.profit_amount}</TableCell>
                      <TableCell>{data.companies.finance_rate}</TableCell>
                      <TableCell>
                        {data.suppliers.finance_rate_before_date}
                      </TableCell>
                      <TableCell>
                        <DialogDelete
                          id={data.id}
                          name={data.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                          title="a cotação no valor"
                          onDelete={() => mutation.mutate(data)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex p-12 justify-center items-center h-[70%] w-full text-gray-500">
            <span>Nenhuma cotação encontrada.</span>
          </div>
        )}
      </div>

      {/* Paginação */}
      {quotations && quotations.data.length > 0 && (
        <div className="flex justify-end items-center p-4">
          <span className="text-sm pr-4">
            Página {pages.currentPage} de {pages.totalPages}
          </span>
          <ChevronsLeft onClick={firstPage} className="hover:bg-zinc-200" />
          <ChevronLeft onClick={decrementPage} className="hover:bg-zinc-200" />
          <ChevronRight onClick={nextPage} className="hover:bg-zinc-200" />
          <ChevronsRight onClick={lastPage} className="hover:bg-zinc-200" />
        </div>
      )}
    </div>
  );
}
