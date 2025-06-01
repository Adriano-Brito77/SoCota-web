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
}

interface SuplliersProps {
  data: Suppliers[];
  onChange: (value: string) => void;
}

export function SelectQuotationSupllier({ data, onChange }: SuplliersProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione o fornecedor" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
