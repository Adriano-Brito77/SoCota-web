"use client";

import React, { useState } from "react";
import { PagesState } from "../quotation/page";
import { api } from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { columns } from "@/app/companies/_components/table-colum";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  
} from "lucide-react";


import { Skeleton } from "@/components/ui/skeleton";
import { DialogCreateCompany } from "@/components/ui/dialog-create-company";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { DialogDelete } from "@/components/ui/dialog-delete";
import { AppError } from "@/errors/app-error";
import { toast } from "react-toastify";
import { DialogEditCompany } from "@/components/ui/dialog-edit-companies";

export interface profitMargins {
  id?: string;
  profit_amount: number;
}

export interface Companies {
  id: string;
  name: string;
  finance_rate: number;
  profit_margins: profitMargins[];
}

interface CompaniesPagination {
  data: Companies[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ProfitMargin {
  id: string;
  profit_amount: number;
}

export interface ProfitMarginsPagination {
  data: ProfitMargin[];
  totalPages: number;
  totalCount: number;
}

export default function Companies() {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [pages, setPages] = useState<PagesState>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 15,
  });

  const {
    isPending,
    error,
    refetch,
    data: companies,
  } = useQuery<CompaniesPagination>({
    queryKey: ["companies", pages.currentPage, pages.pageSize],
    queryFn: async () => {
      const response = await api.get("companies", {
        params: {
          page: pages.currentPage,
          pageSize: pages.pageSize,
          orderBy: "name,asc",
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
    data: companies?.data ?? [],
    columns,
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
    refetch();
  };

  const lastPage = () => {
    setPages((prev: PagesState) => ({
      ...prev,
      currentPage: pages.totalPages,
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data: Companies) => {
      const res = await api.delete(`/companies/${data.id}`);

      return res.data;
    },
    onSuccess: async (data) => {
      await refetch?.();
      toast.success("Fornecedor excluido com sucesso!");
    },

    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AppError ? error.message : "Erro ao realizar Edição.";
      toast.error(errorMessage);
    },
  });
  return (
    <div>
      <main className="p-8  text-4xl h-full">
        <div className="flex justify-between">
          <h1 className="font-bold">Empresas</h1>

          <DialogCreateCompany refresh={refetch} />
        </div>

        <div className="flex justify-end align-middle pt-6">
          <div className="flex justify-center align-middle w-[200px]"></div>
        </div>

        <div className="mt-8 p-4 h-auto overflow-y-auto border-2 rounded-lg  bg-white">
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
          ) : companies?.data && companies.data.length > 0 ? (
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
                {companies.data.map((data) => (
                  <React.Fragment key={data.id}>
                    <TableRow className="cursor-pointer hover:bg-muted">
                      <TableCell
                        onClick={() =>
                          setOpenRow(openRow === data.id ? null : data.id)
                        }
                      >
                        {data.name}
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          setOpenRow(openRow === data.id ? null : data.id)
                        }
                      >
                        {data.finance_rate}
                      </TableCell>
                      <TableCell className="flex gap-4">
                        <DialogEditCompany company={data} refresh={refetch} />
                        <DialogDelete
                          id={data.id}
                          name={data.name}
                          title="a empresa"
                          onDelete={() => mutation.mutate(data)}
                        />
                      </TableCell>
                    </TableRow>
                    {openRow === data.id && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="bg-white p-4"
                        >
                          <div className="grid grid-cols-3 gap-10 bg-white">
                            {data.profit_margins.map((profit, idx) => (
                              <Label key={idx}>
                                Margem:
                                <Input value={profit.profit_amount} disabled />
                              </Label>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex p-12 justify-center items-center h-[70%] w-full text-gray-500">
              <span>Nenhuma empresa encontrado.</span>
            </div>
          )}
        </div>
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
      </main>
    </div>
  );
}
