"use client";
import { ChevronUp, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent("Hello, ShoePedi!");

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "#";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  const youtubeUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  return (
    <footer className="bg-black text-white underline-link">
      {/* Back to Top Button */}
      <div className="w-full">
        <Button
          variant="ghost"
          className="bg-gray-800 w-full rounded-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Back to top
        </Button>
      </div>

      {/* Main Footer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 max-w-7xl mx-auto">
        {/* Column 1: Get to Know Us */}
        <div>
          <h3 className="font-bold mb-4">Get to Know Us</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/page/FAQs" className="hover:text-gray-300">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="hover:text-gray-300">
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/page/about-us" className="hover:text-gray-300">
                About {site.name}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              {/* <Clock size={20} /> */}
              <span>Mon - Sat | 9:00 AM - 7:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Make Money with Us */}
        <div>
          <h3 className="font-bold mb-4">Make Money with Us</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/page/sell" className="hover:text-gray-300">
                Sell products on {site.name}
              </Link>
            </li>
            <li>
              <Link
                href="/page/become-affiliate"
                className="hover:text-gray-300"
              >
                Become an Affiliate
              </Link>
            </li>
            <li>
              <Link href="/page/advertise" className="hover:text-gray-300">
                Advertise Your Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Let Us Help You */}
        <div>
          <h3 className="font-bold mb-4">Let Us Help You</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/page/shipping" className="hover:text-gray-300">
                Shipping Rates & Policies
              </Link>
            </li>
            <li>
              <Link href="/page/returns-policy" className="hover:text-gray-300">
                Returns & Replacements
              </Link>
            </li>
            <li>
              <Link href="/page/help" className="hover:text-gray-300">
                Help
              </Link>
            </li>
            <li>
              <Link
                href="/page/shoe-size-guide"
                className="hover:text-gray-300"
              >
                Size Guide (Shoes)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Social Media Links */}
        <div>
          <h3 className="font-bold mb-4">Follow us</h3>
          <ul className="flex items-center gap-3 flex-wrap">
            <li>
              <Link
                href={instagramUrl}
                target="_blank"
                className="hover:opacity-80 flex items-center gap-1"
              >
                <Image src={Instagram} alt="x.com" width={24} height={24} />
              </Link>
            </li>
            <li>
              <Link
                href={facebookUrl}
                target="_blank"
                className="hover:opacity-80 flex items-center gap-1"
              >
                <Image src={Facebook} alt="x.com" width={24} height={24} />
              </Link>
            </li>

            <li>
              <Link
                href={twitterUrl}
                target="_blank"
                className="hover:opacity-80 flex items-center gap-1"
              >
                <Image
                  src={XIcon}
                  alt="x.com"
                  width={18}
                  height={18}
                  className="bg-white rounded-sm"
                />
              </Link>
            </li>

            <li>
              <Link
                href={tiktokUrl}
                target="_blank"
                className="hover:opacity-80 flex items-center gap-1"
              >
                <Image src={Tiktok} alt="Tiktok" width={24} height={24} />
              </Link>
            </li>

            <li>
              <Link
                href={youtubeUrl}
                target="_blank"
                className="hover:opacity-80 flex items-center gap-1"
              >
                <Image src={Youtube} alt="Tiktok" width={24} height={24} />
              </Link>
            </li>
          </ul>
          <div className="my-2">
            <Link
              href="mailto:info@shoepedi.co.ke"
              className="hover:text-gray-300 flex items-center gap-1"
            >
              <Mail size={20} className="text-gray-500" />
              info@shoepedi.co.ke
            </Link>
          </div>
          <div className="my-2">
            <Link
              href={whatsappLink}
              target="_blank"
              className="hover:text-gray-300 flex items-center gap-1"
            >
              <Image src={WhatsApp} alt="WhatsApp" width={24} height={24} />
              Ask on WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 flex flex-wrap items-center justify-center md:justify-between gap-y-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src={site.logo}
                alt={`${site.name} logo`}
                width={48}
                height={48}
                priority
                className="w-12 h-auto"
              />
              <h1 className="text-2xl font-bold">{site.name}</h1>
              {/* <div className="mt-1">
                <h1 className="text-2xl font-bold">{site.name}</h1>
                <p className="text-xs -mt-2 text-end text-primary">
                  Collections
                </p>
              </div> */}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
            <Link
              href="/page/conditions-of-use"
              className="hover:text-gray-300"
            >
              Conditions of Use
            </Link>
            <Link href="/page/privacy-policy" className="hover:text-gray-300">
              Privacy Notice
            </Link>
            <Link href="/page/help" className="hover:text-gray-300">
              Help
            </Link>
          </div>

          {/* Address and Contact */}
          <div className="flex flex-col items-center md:items-start text-sm text-gray-400">
            <div className="text-center">{site.address}</div>
            <div className="text-center">{site.phone}</div>
          </div>

          {/* Copyright */}
          <div className="text-center w-full">{site.copyright}</div>
        </div>
      </div>
    </footer>
  );
}
