"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockSubscriptionSchema } from "@/lib/validator";
import { toast } from "sonner";
import { subscribeToStock } from "@/lib/actions/stock.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const response = await subscribeToStock({ email: data.email, productId });

    if (response.success) {
      toast.success(
        "Subscription successful! You’ll be notified when this product is in stock."
      );
      reset();
      setIsOpen(false);
    } else {
      toast.error(response.message);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Enter your email:
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className="w-full mt-1 p-2"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {isMobile ? (
          <DrawerClose asChild>
            <Button type="button" className="px-4 py-2 rounded-md">
              Cancel
            </Button>
          </DrawerClose>
        ) : (
          <DialogClose asChild>
            <Button type="button" className="px-4 py-2">
              Cancel
            </Button>
          </DialogClose>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
    </form>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className={`px-4 py-2 rounded-full w-auto ${className}`}>
          Notify Me When Available
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full max-w-none p-4 flex flex-col gap-4">
        <DrawerTitle className="text-lg font-semibold mb-4">
          Get Notified When Available
        </DrawerTitle>
        <FormContent />
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={`px-4 py-2 w-auto ${className}`}>
          Notify Me When Available
        </Button>
      </DialogTrigger>

      <DialogContent className="p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <DialogTitle>Get Notified When Available</DialogTitle>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
