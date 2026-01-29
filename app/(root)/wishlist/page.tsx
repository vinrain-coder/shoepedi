import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";
import WishlistClient from "./wishlist-client";
import { getWishlistProducts } from "@/lib/actions/wishlist.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your Wishlist",
};

export default async function Wishlist() {
  //const session = await getServerSession();
  //if (!session?.user) {
    //redirect("/sign-in?callbackUrl=/wishlist");
 // }
  const products = await getWishlistProducts();

  // Convert to JSON-safe plain objects
  const plainProducts = JSON.parse(JSON.stringify(products));

  return (
    <>
      <Breadcrumb />
      <WishlistClient products={plainProducts} />
      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>
    </>
  );
}
