import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function AutoResizeTextarea({
  className,
  ...props
}: AutoResizeTextareaProps) {
  return (
    <TextareaAutosize
      minRows={3}
      maxRows={10}
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
