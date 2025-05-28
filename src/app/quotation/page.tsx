"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { ApiError } from "next/dist/server/api-utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

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

type PagesState = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export default function Quotation() {
  const [pages, setPages] = useState<PagesState>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
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

  const nextPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, pages.totalPages),
    }));
    refetch();
  };

  const decrementPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  return (
    <div className="p-8 font-bold text-4xl h-full">
      <div>
        <h1>Quotações</h1>
      </div>
      <div className="flex items-end justify-end">
        <button className="bg-blue-500 rounded-sm p-2 text-sm text-amber-50">
          Incluir cotação
        </button>
      </div>

      <div className="mt-8 h-[60%] overflow-y-auto border-2 rounded-lg p-4">
        {quotations && quotations.data ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="w-[100px]">dolar</TableHead>
                <TableHead>Data de pagamento</TableHead>
                <TableHead>valor</TableHead>
                <TableHead>Margin fin. Emp</TableHead>
                <TableHead>Margin Emp</TableHead>
                <TableHead>Margin do Fornecedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.data.map((data) => (
                <TableRow key={data.id}>
                  <TableCell className="font-medium">
                    {data.products.productName}
                  </TableCell>
                  <TableCell>{data.suppliers.name}</TableCell>
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
                  <TableCell>{data.profit_margins.profit_amount}</TableCell>
                  <TableCell>{data.companies.finance_rate}</TableCell>
                  <TableCell>
                    {data.suppliers.finance_rate_before_date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex mt-20 justify-center items-center h-[70%] w-full text-gray-500">
            <span>Nenhuma cotação encontrada.</span>
          </div>
        )}
      </div>
      <div className="flex justify-end items-center p-4">
        <span className="text-sm pr-4">
          Pagina {pages.currentPage} de {pages.totalPages}
        </span>
        <ChevronsLeft></ChevronsLeft>
        <ChevronLeft onClick={decrementPage}></ChevronLeft>
        <ChevronRight onClick={nextPage}></ChevronRight>
        <ChevronsRight></ChevronsRight>
      </div>
    </div>
  );
}
