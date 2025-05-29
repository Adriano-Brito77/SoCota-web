import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Suppliers {
  id: string;
  name: string;
  finance_rate_before_date: number;
  finance_rate_after_date: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  userId: string;
}

export interface SupliersPagination {
  data: Suppliers[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export function SelectDemo({
  data,
  totalCount,
  totalPages,
  currentPage,
  Supplier,
}: SupliersPagination & { Supplier: any }) {
  return (
    <Select onValueChange={Supplier}>
      <SelectTrigger className="w-[200px] ">
        <SelectValue placeholder="Selecione o fornecedor" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((data) => (
            <SelectItem key={data.id} value={data.id}>
              {data.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
