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

export function BlogsDateRangePicker({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const calendarDate = React.useMemo<DateRange | undefined>(
    () =>
      fromParam && toParam
        ? { from: new Date(fromParam), to: new Date(toParam) }
        : fromParam
        ? { from: new Date(fromParam) }
        : undefined,
    [fromParam, toParam]
  );

  const [draftCalendarDate, setDraftCalendarDate] = React.useState<DateRange | undefined>(calendarDate);

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

  React.useEffect(() => {
    setDraftCalendarDate(calendarDate);
  }, [calendarDate]);

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
              <span>Updated in...</span>
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