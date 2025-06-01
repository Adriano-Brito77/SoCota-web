"use client";
import { DataTableColumnHeader } from "@/components/ui/data-table/table-colunm-header";
import { ColumnDef } from "@tanstack/react-table";
import { Companies } from "../page";

export const columns: ColumnDef<Companies>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "finance_rate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Financeiro" />
    ),
    filterFn: "includesString",
  },
];
