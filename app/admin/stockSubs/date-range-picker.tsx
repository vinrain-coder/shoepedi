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

export function StockSubDateRangePicker({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  // Committed range derived from URL
  const committedRange = React.useMemo(() => {
    return fromParam && toParam
      ? { from: new Date(fromParam), to: new Date(toParam) }
      : fromParam
      ? { from: new Date(fromParam) }
      : undefined;
  }, [fromParam, toParam]);

  // Draft state for popover/calendar
  const [draftCalendarDate, setDraftCalendarDate] = React.useState<DateRange | undefined>(committedRange);

  // Sync draft with committed range when searchParams change
  React.useEffect(() => {
    setDraftCalendarDate(committedRange);
  }, [committedRange]);

  // Sync draft with committed range when popover opens (in case of cancelled previous edits)
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftCalendarDate(committedRange);
    }
  };

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
    setDraftCalendarDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal min-w-[240px]",
              !committedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {committedRange?.from ? (
              committedRange.to ? (
                <>
                  {formatDateTime(committedRange.from).dateOnly} -{" "}
                  {formatDateTime(committedRange.to).dateOnly}
                </>
              ) : (
                formatDateTime(committedRange.from).dateOnly
              )
            ) : (
              <span>Subscribed in...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={draftCalendarDate?.from}
            selected={draftCalendarDate}
            onSelect={setDraftCalendarDate}
            numberOfMonths={2}
          />
          <div className="flex gap-4 p-4 pt-0">
            <PopoverClose asChild>
              <Button onClick={() => applyRange(draftCalendarDate)}>Apply</Button>
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
