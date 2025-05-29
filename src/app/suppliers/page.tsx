"use client";
import { api } from "@/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogEdit } from "@/components/ui/dialog-edit";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash,
  Pencil,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./_components/table-column";
import { useState } from "react";
import { PagesState } from "../quotation/page";
import { DialogSuppliers } from "@/components/ui/dialog-suppliers";
import { toast } from "react-toastify";
import { AppError } from "@/errors/app-error";

export interface Supplier {
  id: string;
  name: string;
  finance_rate_before_date: number;
  finance_rate_after_date: number;
}

interface Supplierpagination {
  data: Supplier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default function Suppliers() {
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
    data: supplier,
  } = useQuery<Supplierpagination>({
    queryKey: ["supplier", pages.currentPage, pages.totalCount],
    queryFn: async () => {
      const response = await api.get("/suppliers", {
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

  const mutation = useMutation({
    mutationFn: async (data: Supplier) => {
      const res = await api.patch(`/suppliers/${data.id}`, data);
      console.log("Login response:", res);

      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Fornecedor atualizado com sucesso!");
      // Redireciona para a página inicial após o login
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof AppError ? error.message : "Erro ao realizar login.";
      toast.error(errorMessage);
    },
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

  const table = useReactTable({
    data: supplier?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-8 font-bold text-4xl h-full">
      <div className="flex justify-between">
        <h1>Fornecedores</h1>
        <DialogSuppliers getSuppliers={refetch} />
      </div>
      <div>
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
                {Array.from({ length: 2 }).map((_, rowIndex) => (
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
          ) : supplier && supplier.data.length > 0 ? (
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
                {supplier.data.map((data: any) => (
                  <TableRow className="font-medium" key={data.id}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell className="font-medium">
                      {data.finance_rate_before_date}
                    </TableCell>
                    <TableCell>{data.finance_rate_after_date}</TableCell>
                    <TableCell className="flex justify-center gap-8">
                      <DialogEdit
                        nameLabel={[
                          "Fornecedor:",
                          "Financeiro de ida:",
                          "Financeiro de volta:",
                        ]}
                        id={data.id}
                        supplier={supplier.data}
                        edit={() => mutation.mutate(data)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex p-12 justify-center items-center h-[70%] w-full text-gray-500">
              <span>Nenhum fornecedor encontrado.</span>
            </div>
          )}
        </div>
        {supplier && supplier.data.length > 0 ? (
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
    </div>
  );
}
