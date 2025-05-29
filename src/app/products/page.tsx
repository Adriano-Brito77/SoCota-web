"use client";
import { useState } from "react";
import { PagesState } from "../quotation/page";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { columns } from "@/app/products/_components/table-column";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, previousDay } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { SelectDemo } from "@/components/ui/select-supliers";
import { SupliersPagination } from "@/components/ui/select-supliers";

export interface Products {
  id: string;
  suppliersName: string;
  priceCatalogName: string;
  productName: string;
  referenceContent: string;
  usdFobPrice: number;
  deliveryStart: string; // ISO 8601 date string
  deliveryEnd: string; // ISO 8601 date string
  financialDueDate: string; // ISO 8601 date string
  userId: string;
}

interface Productspagination {
  data: Products[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const ProductsPage = () => {
  const [supplier, setSupplier] = useState("");
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
    data: products,
  } = useQuery<Productspagination>({
    queryKey: ["products", pages.currentPage, pages.pageSize, supplier],
    queryFn: async () => {
      const response = await api.get("/excel/products", {
        params: {
          page: pages.currentPage,
          pageSize: pages.pageSize,
          orderBy: "suppliersName,asc",
          search: supplier,
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

  const suppliers = useQuery<SupliersPagination>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await api.get("/suppliers", {
        params: {
          page: pages.currentPage,
          pageSize: pages.pageSize,
          orderBy: "name,asc",
          search: "",
        },
      });
      return response.data;
    },
  });

  const switchSupliers = (data: any) => {
    setSupplier(data);
    console.log(supplier);
  };

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

  const table = useReactTable({
    data: products?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <main className="p-8 font-bold text-4xl h-full">
      <div className=" flex justify-between">
        <h1>Produtos</h1>

        <button className="bg-blue-500 w-[200px] hover:bg-blue-700 rounded-sm text-sm text-amber-50">
          <span className="p-8">Importar Produtos</span>
        </button>
      </div>

      <div className="flex justify-end align-middle pt-6">
        <div className="flex justify-center align-middle w-auto">
          {!suppliers.isLoading && suppliers.data && (
            <SelectDemo {...suppliers.data} Supplier={switchSupliers} />
          )}
        </div>
      </div>

      <div className="mt-8 p-4 h-auto overflow-y-auto border-2 rounded-lg bg-white">
        {products && products.data ? (
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
              {products.data.map((data) => (
                <TableRow className="font-medium " key={data.id}>
                  <TableCell className="font-medium 4">
                    {data.priceCatalogName}
                  </TableCell>
                  <TableCell className="font-medium ">
                    {data.productName}
                  </TableCell>
                  <TableCell className="font-medium ">
                    {data.suppliersName}
                  </TableCell>
                  <TableCell>
                    {data.usdFobPrice.toLocaleString("pt-Br", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(data.deliveryStart), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(data.deliveryEnd), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(data.financialDueDate), "dd/MM/yyyy")}
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
          Página {pages.currentPage} de {pages.totalPages}
        </span>
        <ChevronsLeft onClick={firstPage} className=" hover:bg-zinc-200 " />
        <ChevronLeft onClick={decrementPage} className=" hover:bg-zinc-200 " />
        <ChevronRight onClick={nextPage} className=" hover:bg-zinc-200 " />
        <ChevronsRight onClick={lastPage} className=" hover:bg-zinc-200 " />
      </div>
    </main>
  );
};

export default ProductsPage;
