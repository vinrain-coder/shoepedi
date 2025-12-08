"use client";

import React from "react";
import useCartSidebar from "@/hooks/use-cart-sidebar";
import CartSidebar from "./cart-sidebar";
import { ThemeProvider } from "./theme-provider";
import AppInitializer from "./app-initializer";
import { ClientSetting } from "@/types";
import { Toaster } from "../ui/sonner";
import { NextIntlClientProvider } from "next-intl";

interface Props {
  setting: ClientSetting;
  children: React.ReactNode;
}

export default function ClientProviders({ setting, children }: Props) {
  const visible = useCartSidebar();

  return (
    <AppInitializer setting={setting}>
      <ThemeProvider
        attribute="class"
        defaultTheme={setting.common.defaultTheme.toLocaleLowerCase()}
      >
        {visible ? (
          <div className="flex min-h-screen">
            <div className="flex-1 overflow-hidden">{children}</div>
            <CartSidebar />
          </div>
        ) : (
          <div>{children}</div>
        )}

        <Toaster duration={4000} richColors closeButton visibleToasts={3} />
      </ThemeProvider>
    </AppInitializer>
  );
}
