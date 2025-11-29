import { notFound } from "next/navigation";

import Link from "next/link";
import { Metadata } from "next";
import { getCouponById } from "@/lib/actions/coupon.actions";
import CouponForm from "../coupon-form";

export const metadata: Metadata = {
  title: "Edit Coupon",
};

type UpdateCouponProps = {
  params: { id: string };
};

const UpdateCoupon = async ({ params }: UpdateCouponProps) => {
  const { id } = params;

  const coupon = await getCouponById(id);
  if (!coupon) notFound();
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/products">Coupons</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/products/${coupon._id}`}>
          {coupon._id.toString()}
        </Link>
      </div>

      <div className="my-8">
        <CouponForm
          type="Update"
          coupon={coupon}
          couponId={coupon._id.toString()}
        />
      </div>
    </main>
  );
};

export default UpdateCoupon;
