import { Metadata } from "next";
import CouponList from "./coupon-list";

export const metadata: Metadata = {
  title: "Admin Coupons",
};

export default async function AdminProduct() {
  return <CouponList />;
}
