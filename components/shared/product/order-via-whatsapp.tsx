"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Image from "next/image";

interface OrderViaWhatsAppProps {
  productName: string;
  color: string;
  size: string;
  quantity?: number;
  price: number; // Add price as a prop
}

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function OrderViaWhatsApp(props: OrderViaWhatsAppProps) {
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    const totalPrice = props.price * (props.quantity || 1);
    const formattedPrice = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(totalPrice);

    const message = encodeURIComponent(`
                                Hello ShoePedi, I'm interested in ordering:
                                - Product: ${props.productName}
                                - Variant: ${props.color} / Size: ${props.size}
                                - Quantity: ${props.quantity || 1}
                                - Price: ${formattedPrice}

                                Link: ${window.location.href}
                                    `);

    setWhatsappUrl(`https://wa.me/${whatsappNumber}?text=${message}`);
  }, []);

  if (!whatsappUrl) return null; // prevent mismatched SSR

  return (
    <Button
      asChild
      className="bg-green-500 hover:bg-green-600 text-white rounded-full w-full"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Image src={WhatsApp} alt="WhatsApp" width={22} height={22} />
        Order via WhatsApp
      </a>
    </Button>
  );
}
