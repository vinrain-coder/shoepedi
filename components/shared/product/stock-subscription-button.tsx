"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell } from "lucide-react";

import { StockSubscriptionSchema } from "@/lib/validator";
import { toast } from "sonner";
import { subscribeToStock } from "@/lib/actions/stock.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingButton } from "../loading-button";
import { cn } from "@/lib/utils";

type SubscribeButtonProps = {
  productId: string;
  className?: string;
};

export default function SubscribeButton({
  productId,
  className,
}: SubscribeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ email: string }>({
    resolver: zodResolver(StockSubscriptionSchema.pick({ email: true })),
  });

  const onSubmit = async (data: { email: string }) => {
    const response = await subscribeToStock({
      email: data.email,
      productId,
    });

    if (response.success) {
      toast.success(
        "Subscribed successfully! We'll notify you once it's back in stock.",
      );
      reset();
      setIsOpen(false);
    } else {
      toast.error(response.message);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="your.email@example.com"
          className="h-11 rounded-xl"
          autoFocus
        />

        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}

        <p className="text-xs text-muted-foreground">
          No spam. We&apos;ll only send one alert when this item is available.
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        {isMobile ? (
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
          </DrawerClose>
        ) : (
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
          </DialogClose>
        )}

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText="Saving..."
          disabled={isSubmitting}
          className="flex-1 rounded-xl"
        >
          <Bell className="mr-2 h-4 w-4" />
          Notify Me
        </LoadingButton>
      </div>
    </form>
  );

  const TriggerButton = (
    <Button
      variant="pending"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <Bell className="h-4 w-4" />
      Notify Me
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>

      <DrawerContent className="rounded-t-3xl px-4 pb-6 pt-4">
        <div className="space-y-1 mb-4">
          <DrawerTitle className="text-lg font-semibold">
            Get Restock Alerts
          </DrawerTitle>

          <DrawerDescription className="text-sm text-muted-foreground">
            We&apos;ll notify you immediately when this product is back in
            stock.
          </DrawerDescription>
        </div>

        <FormContent />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>

      <DialogContent className="w-[90%] max-w-md rounded-2xl p-6 shadow-xl">
        <div className="space-y-1 mb-4">
          <DialogTitle className="text-lg font-semibold">
            Get Restock Alerts
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            We&apos;ll notify you immediately when this product is back in
            stock.
          </DialogDescription>
        </div>

        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
