"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { columns } from "@/app/quotation/_components/table-column";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogCreateQuotation } from "@/components/ui/dialog-create-quotation";

export interface Quotation {
  id: string;
  products: {
    productName: string;
  };
  suppliers: {
    name: string;
    finance_rate_before_date: number;
  };
  dollar_rate: number;
  payment_date: string;
  price: number;
  profit_margins: {
    profit_amount: number;
  };
  companies: {
    finance_rate: number;
  };
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

  const {
    isPending,
    error,
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

  const table = useReactTable({
    data: quotations?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const nextPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, pages.totalPages),
    }));
  };

  const decrementPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  const firstPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const lastPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: pages.totalPages,
    }));
  };

  return (
    <div className="p-8 font-bold text-4xl h-full">
      <div className="flex justify-between">
        <h1>Cotações</h1>
        <div className="flex items-end justify-end">
          <DialogCreateQuotation getSuppliers={refetch} />
        </div>
      </div>
      <div className="mt-8 p-4 h-auto overflow-y-auto border-2 rounded-lg  bg-white">
        {quotations && quotations.data.length > 0 ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead className="font-bold" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isPending ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: columns.length }).map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: columns.length }).map(
                          (_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                quotations.data.map((data: any) => (
                  <TableRow className="font-medium " key={data.id}>
                    <TableCell className="font-medium 4">
                      {data.products.productName}
                    </TableCell>
                    <TableCell className="font-medium ">
                      {data.suppliers.name}
                    </TableCell>
                    <TableCell>
                      {data.dollar_rate.toLocaleString("pt-Br", {
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
                      {data.delivery_fee.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>{data.profit_margins.profit_amount}</TableCell>
                    <TableCell>{data.companies.finance_rate}</TableCell>
                    <TableCell>
                      {data.suppliers.finance_rate_before_date}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex p-12 justify-center items-center h-[70%] w-full text-gray-500">
            <span>Nenhuma cotação encontrada.</span>
          </div>
        )}
      </div>
      {quotations && quotations.data.length > 0 ? (
        <div className="flex justify-end items-center p-4">
          <span className="text-sm pr-4">
            Página {pages.currentPage} de {pages.totalPages}
          </span>
          <ChevronsLeft onClick={firstPage} className=" hover:bg-zinc-200 " />
          <ChevronLeft
            onClick={decrementPage}
            className=" hover:bg-zinc-200 "
          />
          <ChevronRight onClick={nextPage} className=" hover:bg-zinc-200 " />
          <ChevronsRight onClick={lastPage} className=" hover:bg-zinc-200 " />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
