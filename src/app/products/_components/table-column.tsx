"use client";
import { DataTableColumnHeader } from "@/components/ui/data-table/table-colunm-header";
import { ColumnDef } from "@tanstack/react-table";
import { Products } from "../page";

export const columns: ColumnDef<Products>[] = [
  {
    accessorKey: "priceCatalogName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catálogo" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produto" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "suppliersName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fornecedores" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "usdFobPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Val. em Dolar" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "deliveryStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entrega de:" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "deliveryEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entrega até:" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "profit_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Venc. da Lista" />
    ),
    filterFn: "includesString",
  },
];
