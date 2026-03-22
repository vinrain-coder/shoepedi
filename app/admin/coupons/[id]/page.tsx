import Link from "next/link";
import { Metadata } from "next";
import CouponForm from "../coupon-form";
import { getCouponById } from "@/lib/actions/coupon.actions";

export const metadata: Metadata = {
  title: "Update Coupon",
};

const UpdateCouponPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const coupon = await getCouponById(id);

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/coupons">Coupons</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/coupons/${id}`}>Edit</Link>
      </div>

      <div className="my-8">
        <CouponForm type="Update" coupon={coupon} couponId={id} />
      </div>
    </main>
  );
};

export default UpdateCouponPage;
