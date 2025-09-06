import * as React from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading: boolean;
  loadingText?: React.ReactNode; // Optional loading text
}

export function LoadingButton({
  loading,
  disabled,
  loadingText,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
