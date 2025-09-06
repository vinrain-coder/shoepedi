"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { formUrlQuery } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(Number(page));

  const onClick = (btnType: string) => {
    const newPage = btnType === "next" ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: newPage.toString(),
    });

    if (btnType === "next") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    router.push(newUrl, { scroll: true });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="lg"
        variant="outline"
        onClick={() => onClick("prev")}
        disabled={currentPage <= 1}
        className="w-24"
      >
        <ChevronLeft /> Previous
      </Button>
      Page {currentPage} of {totalPages}
      <Button
        size="lg"
        variant="outline"
        onClick={() => onClick("next")}
        disabled={currentPage >= totalPages}
        className="w-24"
        onMouseEnter={() =>
          router.prefetch(
            formUrlQuery({
              params: searchParams.toString(),
              key: urlParamName || "page",
              value: (currentPage + 1).toString(),
            })
          )
        }
      >
        Next <ChevronRight />
      </Button>
    </div>
  );
};

export default Pagination;
