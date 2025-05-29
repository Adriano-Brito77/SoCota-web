"use client";
import { DataTableColumnHeader } from "@/components/ui/data-table/table-colunm-header";
import { ColumnDef } from "@tanstack/react-table";
import { Supplier } from "../page";

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "finance_rate_before_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Financeiro de volta" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "finance_rate_after_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Financeiro de ida" />
    ),
    filterFn: "includesString",
  },
];
