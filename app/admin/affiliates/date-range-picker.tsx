"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn, formatDateTime } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PopoverClose } from "@radix-ui/react-popover";

export function AffiliatesDateRangePicker({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const parseDate = (dateStr: string | null): Date | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const computeDateRange = React.useCallback((): DateRange | undefined => {
    const from = parseDate(fromParam);
    const to = parseDate(toParam);
    if (from && to) return { from, to };
    if (from) return { from };
    return undefined;
  }, [fromParam, toParam]);

  const [calendarDate, setCalendarDate] = React.useState<DateRange | undefined>(
    computeDateRange()
  );

  React.useEffect(() => {
    setCalendarDate(computeDateRange());
  }, [computeDateRange]);

  const applyRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set("from", range.from.toISOString());
    } else {
      params.delete("from");
    }
    if (range?.to) {
      params.set("to", range.to.toISOString());
    } else {
      params.delete("to");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearRange = () => {
    setCalendarDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal min-w-[240px]",
              !calendarDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {calendarDate?.from ? (
              calendarDate.to ? (
                <>
                  {formatDateTime(calendarDate.from).dateOnly} -{" "}
                  {formatDateTime(calendarDate.to).dateOnly}
                </>
              ) : (
                formatDateTime(calendarDate.from).dateOnly
              )
            ) : (
              <span>Filter statistics by date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="end"
        >
          <Calendar
            mode="range"
            defaultMonth={calendarDate?.from}
            selected={calendarDate}
            onSelect={setCalendarDate}
            numberOfMonths={2}
          />
          <div className="flex gap-4 p-4 pt-0">
            <PopoverClose asChild>
              <Button onClick={() => applyRange(calendarDate)}>Apply</Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      {(fromParam || toParam) && (
        <Button variant="ghost" size="icon" onClick={clearRange}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
