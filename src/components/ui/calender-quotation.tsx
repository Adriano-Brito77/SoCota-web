"use client";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";

interface DatePickerProps {
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ onChange }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) onChange(selectedDate); // avisa o pai
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? (
            format(date, "PPP", { locale: ptBR })
          ) : (
            <span>Selecione uma data </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
