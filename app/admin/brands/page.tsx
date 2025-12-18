import { Metadata } from "next";
import BrandList from "./brand-list";

export const metadata: Metadata = {
  title: "Admin Brands",
};

export default async function AdminBrand() {
  return <BrandList />;
}
