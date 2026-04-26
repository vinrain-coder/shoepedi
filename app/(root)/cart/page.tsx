"use client";
import Breadcrumb from "@/components/shared/breadcrumb";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductsByIds } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { ChevronLeft, ShoppingBag, Trash2 } from "lucide-react";
import QuantityController from "@/components/shared/product/quantity-controller";
import DeliveryEstimator from "@/components/shared/product/delivery-estimator";
import TrustBadges from "@/components/shared/trust-badges";

export default function CartPage() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore();
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = items.map((item) => item.product);
      const uniqueProductIds = [...new Set(productIds)];
      if (uniqueProductIds.length > 0) {
        const fetchedProducts = await getProductsByIds(uniqueProductIds);
        setProducts(fetchedProducts);
      }
    };
    fetchProducts();
  }, [items]);
  const router = useRouter();
  const { setting } = useSettingStore();
  const {
    common: { freeShippingMinPrice },
  } = setting;

  return (
    <div>
      <div className="my-1">
        <Breadcrumb />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        {items.length === 0 ? (
          <Card className="col-span-4 rounded-xl border-none bg-muted/30 p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <div className="rounded-full bg-background p-6 shadow-sm">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/search">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                  Shopping Cart
                </h1>
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground"
                >
                  <Link href="/search" className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              <Card className="rounded-xl overflow-hidden border-border/60 shadow-sm">
                <CardContent className="p-0">
                  <div className="hidden md:grid grid-cols-12 gap-4 border-b bg-muted/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  <div className="divide-y divide-border/60">
                    {items.map((item) => (
                      <div
                        key={item.clientId}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 hover:bg-muted/5 transition-colors"
                      >
                        <div className="col-span-1 md:col-span-6 flex gap-4">
                          <Link
                            href={`/product/${item.slug}`}
                            className="shrink-0"
                          >
                            <div className="relative aspect-square w-24 h-24 sm:w-32 sm:h-32 rounded-lg border bg-white overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100px, 150px"
                                className="object-contain p-2"
                              />
                            </div>
                          </Link>

                          <div className="flex flex-col justify-between py-1">
                            <div>
                              <Link
                                href={`/product/${item.slug}`}
                                className="font-semibold text-lg leading-tight hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {item.color && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-foreground">
                                      Color:
                                    </span>
                                    <div
                                      style={{ backgroundColor: item.color }}
                                      className="h-3 w-3 rounded-full border border-muted-foreground"
                                    />
                                    <Select
                                      value={item.color}
                                      onValueChange={(value) =>
                                        updateItem(
                                          item,
                                          item.quantity,
                                          value,
                                          item.size,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-auto border-none bg-transparent p-0 font-normal hover:text-foreground focus:ring-0">
                                        <SelectValue>{item.color}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(() => {
                                          const product = products.find(
                                            (p) =>
                                              p._id.toString() === item.product,
                                          );
                                          return product?.colors?.length
                                            ? product.colors.map((color) => (
                                                <SelectItem
                                                  key={color}
                                                  value={color}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      style={{
                                                        backgroundColor: color,
                                                      }}
                                                      className="h-3 w-3 rounded-full border border-muted-foreground"
                                                    />
                                                    {color}
                                                  </div>
                                                </SelectItem>
                                              ))
                                            : null;
                                        })()}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {item.size && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-foreground">
                                      Size:
                                    </span>
                                    <Select
                                      value={item.size}
                                      onValueChange={(value) =>
                                        updateItem(
                                          item,
                                          item.quantity,
                                          item.color,
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-auto border-none bg-transparent p-0 font-normal hover:text-foreground focus:ring-0">
                                        <SelectValue>{item.size}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(() => {
                                          const product = products.find(
                                            (p) =>
                                              p._id.toString() === item.product,
                                          );
                                          return product?.sizes?.length
                                            ? product.sizes.map((size) => (
                                                <SelectItem
                                                  key={size}
                                                  value={size}
                                                >
                                                  {size}
                                                </SelectItem>
                                              ))
                                            : null;
                                        })()}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item)}
                              className="w-fit h-auto p-0 text-destructive hover:text-destructive/80 hover:bg-transparent"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center">
                          <span className="md:hidden text-sm font-medium text-muted-foreground uppercase">
                            Quantity
                          </span>
                          <QuantityController
                            quantity={item.quantity}
                            countInStock={item.countInStock}
                            onQuantityChange={(newQuantity) =>
                              updateItem(item, newQuantity)
                            }
                          />
                        </div>

                        <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end">
                          <span className="md:hidden text-sm font-medium text-muted-foreground uppercase">
                            Total
                          </span>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              <ProductPrice
                                price={item.price * item.quantity}
                                plain
                              />
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                <ProductPrice price={item.price} plain /> each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 lg:mt-0 space-y-6">
              <Card className="rounded-xl border-border/60 shadow-sm sticky top-4 z-100">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Items (
                        {items.reduce((acc, item) => acc + item.quantity, 0)})
                      </span>
                      <ProductPrice price={itemsPrice} plain />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-4 flex justify-between items-baseline">
                      <span className="font-bold text-lg">Subtotal</span>
                      <span className="font-bold text-2xl text-primary">
                        <ProductPrice price={itemsPrice} plain />
                      </span>
                    </div>
                  </div>

                  {itemsPrice < freeShippingMinPrice ? (
                    <div className="rounded-lg bg-primary/5 p-3 text-sm text-primary">
                      Add{" "}
                      <span className="font-bold">
                        <ProductPrice
                          price={freeShippingMinPrice - itemsPrice}
                          plain
                        />
                      </span>{" "}
                      more to qualify for{" "}
                      <span className="font-bold uppercase">Free Shipping</span>
                    </div>
                  ) : (
                    <div className=" bg-green-50 p-3 text-sm text-green-700 font-medium flex items-center gap-2 animate-pulse rounded-full">
                      <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                      Your order qualifies for FREE Shipping
                    </div>
                  )}

                  <Button
                    onClick={() => router.push("/checkout")}
                    size="lg"
                    className="w-full rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Checkout
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground">
                    Taxes and shipping calculated at checkout
                  </p>
                </CardContent>
              </Card>

              <DeliveryEstimator
                deliveryDates={setting.availableDeliveryDates}
                itemsPrice={itemsPrice}
              />

              <TrustBadges />
            </div>
          </>
        )}
      </div>
      <BrowsingHistoryList className="mt-10" />
    </div>
  );
}
