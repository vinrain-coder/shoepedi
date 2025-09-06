import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";
import WishlistPage from "./wishlist";

export const metadata: Metadata = {
  title: "Your Wishlist",
};

export default async function Wishlist() {
  return (
    <>
      <WishlistPage />
      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>
    </>
  );
}
