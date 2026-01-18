"use client";

import { ChevronUp, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import useSettingStore from "@/hooks/use-setting-store";

import XIcon from "@/public/icons/x.svg";
import Tiktok from "@/public/icons/tiktok.svg";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Youtube from "@/public/icons/youtube.svg";
import Facebook from "@/public/icons/facebook.svg";
import Instagram from "@/public/icons/instagram.svg";

export default function Footer() {
  const {
    setting: { site },
  } = useSettingStore();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const message = encodeURIComponent("Hello, ShoePedi!");
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : "#";

  const socialLinks = {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
  };

  const footerSections = [
    {
      title: "Shop",
      links: [
        { label: "Products", href: "/search" },
        { label: "Categories", href: "/categories" },
        { label: "Our brands", href: "/brands" },
        { label: "Today's deal", href: "/search?tag=todays-deal" },
        { label: "Featured products", href: "/search?tag=best-seller" },
      ],
    },
    {
      title: "Get to Know Us",
      links: [
        { label: "FAQs", href: "/page/frequently-asked-questions" },
        { label: "Blogs", href: "/blogs" },
        { label: `About ${site.name}`, href: "/page/about-us" },
        {
          label: "Mon - Sat | 9:00 AM - 7:00 PM",
          href: "#",
          static: true,
        },
      ],
    },
    {
      title: "Make Money with Us",
      links: [
        {
          label: `Sell products on ${site.name}`,
          href: "/page/sell-products",
        },
        { label: "Become an Affiliate", href: "/page/become-affiliate" },
        {
          label: "Advertise Your Products",
          href: "/page/advertise-your-products",
        },
      ],
    },
    {
      title: "Let Us Help You",
      links: [
        {
          label: "Shipping Rates & Policies",
          href: "/page/shipping-rates-policies",
        },
        { label: "Returns & Replacements", href: "/page/returns-policy" },
        { label: "Help", href: "/page/help" },
        { label: "Size Guide (Shoes)", href: "/page/shoe-size-guide" },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Back to Top */}
      <Button
        variant="ghost"
        className="bg-[#232f3e] hover:bg-[#37475a] text-white w-full rounded-none h-12"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ChevronUp className="mr-2 h-4 w-4" />
        Back to top
      </Button>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* MOBILE */}
        <div className="block md:hidden mb-8">
          <Accordion type="single" collapsible className="border-t border-gray-800">
            {footerSections.map((section, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border-b border-gray-800"
              >
                <AccordionTrigger className="font-bold py-4">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pb-4">
                    {section.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        {link.static ? (
                          <span className="text-gray-400 text-sm">
                            {link.label}
                          </span>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-gray-300 hover:text-white text-sm"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-bold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.static ? (
                      <span className="text-gray-400 text-sm">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* SOCIAL */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow us</h3>

            <div className="flex gap-4 mb-6">
              {[
                { src: Instagram, url: socialLinks.instagram },
                { src: Facebook, url: socialLinks.facebook },
                { src: XIcon, url: socialLinks.twitter, bg: true },
                { src: Tiktok, url: socialLinks.tiktok },
                { src: Youtube, url: socialLinks.youtube },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.url}
                  target="_blank"
                  className="hover:opacity-75"
                >
                  <Image
                    src={social.src}
                    alt="social"
                    width={24}
                    height={24}
                    className={social.bg ? "bg-white rounded-sm p-0.5" : ""}
                  />
                </Link>
              ))}
            </div>

            <div className="space-y-3">
              <Link
                href="mailto:info@shoepedi.co.ke"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
              >
                <Mail size={18} />
                info@shoepedi.co.ke
              </Link>

              <Link
                href={whatsappLink}
                target="_blank"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
              >
                <Image src={WhatsApp} alt="WA" width={20} height={20} />
                Ask on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="bg-[#131a22] border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src={site.logo} alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold">{site.name}</span>
          </Link>

          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <Link href="/page/conditions-of-use">Conditions of Use</Link>
            <Link href="/page/privacy-policy">Privacy Notice</Link>
            <Link href="/page/help">Help</Link>
          </div>

          <div className="text-xs text-gray-500">
            <p>{site.address} • {site.phone}</p>
            <p>{site.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
    }
    
