import { Metadata } from "next";
import CategoryList from "./categories-list";

export const metadata: Metadata = {
  title: "Admin Categories",
};

export default async function AdminCategory() {
  return <CategoryList />;
}
