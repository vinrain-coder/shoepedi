"use client";
import { ChevronUp, Mail, MapPin, Phone } from "lucide-react";
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
  const { setting: { site } } = useSettingStore();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const message = encodeURIComponent("Hello, ShoePedi!");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;
 const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "#";

const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  const youtubeUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      {/* Back to Top */}
      <Button
        variant="ghost"
        className="w-full rounded-none bg-neutral-900 hover:bg-neutral-800 text-gray-400 hover:text-white border-b border-gray-800 h-12"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ChevronUp className="mr-2 h-4 w-4" />
        Back to top
      </Button>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Grid - Responsive Column Spanning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Shop */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/search" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/search?tag=new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/search?tag=best-sellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/search?tag=featured" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>

          {/* Column 2: Get to Know Us */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight">Get to Know Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/page/about-us" className="hover:text-white transition-colors">About {site.name}</Link></li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link></li>
              <li><Link href="/page/FAQs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li className="pt-2 text-xs text-gray-500 uppercase tracking-widest">Mon - Sat | 9 AM - 7 PM</li>
            </ul>
          </div>

          {/* Column 3: Make Money */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight">Make Money</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/page/sell" className="hover:text-white transition-colors">Sell on {site.name}</Link></li>
              <li><Link href="/page/become-affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
              <li><Link href="/page/advertise" className="hover:text-white transition-colors">Advertise Products</Link></li>
            </ul>
          </div>

          {/* Column 4: Let Us Help */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight">Help & Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/page/shipping" className="hover:text-white transition-colors">Shipping Policies</Link></li>
              <li><Link href="/page/returns-policy" className="hover:text-white transition-colors">Returns & Replacements</Link></li>
              <li><Link href="/page/shoe-size-guide" className="hover:text-white transition-colors">Shoe Size Guide</Link></li>
              <li><Link href="/page/help" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Column 5: Social & Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg tracking-tight">Connect</h3>
            <div className="flex flex-wrap gap-4 mb-6">
               <Link href={instagramUrl} target="_blank"><Image src={Instagram} alt="Instagram" width={22} height={22} className="hover:scale-110 transition-transform" /></Link>
               <Link href={facebookUrl} target="_blank"><Image src={Facebook} alt="Facebook" width={22} height={22} className="hover:scale-110 transition-transform" /></Link>
               <Link href={twitterUrl} target="_blank"><Image src={XIcon} alt="X" width={20} height={20} className="bg-white rounded-sm hover:scale-110 transition-transform" /></Link>
               <Link href={tiktokUrl} target="_blank"><Image src={Tiktok} alt="Tiktok" width={22} height={22} className="hover:scale-110 transition-transform" /></Link>
            </div>
            
            <div className="space-y-3 text-sm text-gray-400">
              <Link href="mailto:info@shoepedi.co.ke" className="flex items-center gap-2 hover:text-white">
                <Mail size={16} /> info@shoepedi.co.ke
              </Link>
              <Link href={whatsappLink} target="_blank" className="flex items-center gap-2 hover:text-white text-green-500 font-medium">
                <Image src={WhatsApp} alt="WhatsApp" width={20} height={20} />
                WhatsApp Chat
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Section */}
      <div className="bg-neutral-950 py-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src={site.logo} alt="Logo" width={40} height={40} className="brightness-110" />
            <span className="text-xl font-black tracking-tighter uppercase italic">{site.name}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 uppercase tracking-widest">
            <Link href="/page/conditions-of-use" className="hover:text-white">Conditions</Link>
            <Link href="/page/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/page/help" className="hover:text-white">Help</Link>
          </div>

          <div className="text-right space-y-1 hidden md:block">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">{site.copyright}</p>
            <p className="text-xs text-gray-500">{site.address}</p>
          </div>
        </div>
      </div>
    </footer>
  );
  }
