import { Metadata } from "next";
import CategoryList from "./categories-list";

export const metadata: Metadata = {
  title: "Admin Products",
};

export default async function AdminProduct() {
  return <CategoryList />;
}
