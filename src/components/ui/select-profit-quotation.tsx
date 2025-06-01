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

export interface Profit {
  id: string;
  company_id: string;
  profit_amount: number;
}

interface ProfitProps {
  data: Profit[];
  onChange: (value: string) => void;
}

export function SelectQuotationProfit({ data, onChange }: ProfitProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione o fornecedor" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((profit) => (
            <SelectItem key={profit.id} value={profit.id}>
              {profit.profit_amount}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
