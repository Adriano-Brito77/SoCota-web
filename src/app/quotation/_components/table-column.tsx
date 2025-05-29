"use client";
import { DataTableColumnHeader } from "@/components/ui/data-table/table-colunm-header";
import { ColumnDef } from "@tanstack/react-table";
import { Quotation } from "../page";

export const columns: ColumnDef<Quotation>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produto" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fornecedor" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "dollar_rate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dólar" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "payment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Pagamento" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "profit_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Margin Empresa" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "finance_rate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Margin Fornecedor" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "finance_rate_before_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Margin de Fin. For." />
    ),
    filterFn: "includesString",
  },
];
