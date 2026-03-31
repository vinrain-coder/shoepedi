import { Metadata } from "next";
import Breadcrumb from "@/components/shared/breadcrumb";
import CompareClient from "./compare-client";

export const metadata: Metadata = {
  title: "Compare Products",
};

export default function ComparePage() {
  return (
    <>
      <Breadcrumb />
      <CompareClient />
    </>
  );
}
