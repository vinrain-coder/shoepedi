import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";
import WishlistClient from "./wishlist-client";
import { getWishlistProducts } from "@/lib/actions/wishlist.actions";

export const metadata: Metadata = {
  title: "Your Wishlist",
};

export default async function Wishlist() {
  const products = await getWishlistProducts();

// Convert to JSON-safe plain objects
const plainProducts = JSON.parse(JSON.stringify(products));

  return (
    <>
      <WishlistClient products={plainProducts} />
      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>
    </>
  );
}
