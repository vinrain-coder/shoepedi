import Link from "next/link";
import { Metadata } from "next";
import CouponForm from "../coupon-form";

export const metadata: Metadata = {
  title: "Create Coupon",
};

const CreateCouponPage = () => {
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/coupons">Coupons</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/coupons/create">Create</Link>
      </div>

      <div className="my-8">
        <CouponForm type="Create" />
      </div>
    </main>
  );
};

export default CreateCouponPage;
