import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { IOrder } from "@/lib/db/models/order.model";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatCurrency } from "@/lib/utils";
import SocialLinks from "./social-links";

type OrderInformationProps = {
  order: IOrder;
};

PurchaseReceiptEmail.PreviewProps = {
  order: {
    _id: "123",
    isPaid: true,
    paidAt: new Date(),
    totalPrice: 100,
    itemsPrice: 100,
    taxPrice: 0,
    shippingPrice: 0,
    coupon: {
      code: "SAVE10",
      discountType: "fixed",
      discountAmount: 10,
    },
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
    shippingAddress: {
      fullName: "John Doe",
      street: "123 Main St",
      city: "New York",
      postalCode: "12345",
      country: "USA",
      phone: "123-456-7890",
      province: "New York",
    },
    items: [
      {
        clientId: "123",
        name: "Product 1",
        image: "https://via.placeholder.com/150",
        price: 100,
        quantity: 1,
        product: "123",
        slug: "product-1",
        category: "Category 1",
        countInStock: 10,
      },
    ],
    expectedDeliveryDate: new Date(),
    isDelivered: true,
  } as IOrder,
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const getCouponDescription = (order: IOrder) => {
  if (!order.coupon) return null;

  if (order.coupon.discountType === "percentage") {
    const percentage = order.itemsPrice
      ? Math.round((order.coupon.discountAmount / order.itemsPrice) * 100)
      : 0;

    return `${percentage}% off your items subtotal`;
  }

  return `${formatCurrency(order.coupon.discountAmount)} saved on this order`;
};

export default async function PurchaseReceiptEmail({
  order,
}: OrderInformationProps) {
  const { site } = await getSetting();
  const orderUrl = `${site.url}/account/orders/${order._id.toString()}`;
  const logoSrc = site.logo.startsWith("/")
    ? `${site.url}${site.logo}`
    : site.logo;
  const couponDescription = getCouponDescription(order);

  const pricingRows = [
    { label: "Items subtotal", value: order.itemsPrice },
    { label: "Shipping", value: order.shippingPrice },
    { label: "Tax", value: order.taxPrice },
    ...(order.coupon
      ? [
          {
            label: `Coupon (${order.coupon.code})`,
            value: -Math.abs(order.coupon.discountAmount),
            isDiscount: true,
          },
        ]
      : []),
    { label: "Order total", value: order.totalPrice, isTotal: true },
  ];

  return (
    <Html>
      <Preview>{`Receipt for order ${order._id.toString()}`}</Preview>
      <Tailwind>
        <Head />
        <Body className="m-0 bg-slate-100 py-10 font-sans text-slate-900">
          <Container className="mx-auto max-w-[640px] px-4">
            <Section className="overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <Section className="bg-slate-950 px-8 py-6">
                <Img
                  alt={site.name}
                  className="max-h-10 w-auto"
                  src={logoSrc}
                />
                <Text className="m-0 mt-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Order confirmation
                </Text>
                <Heading className="m-0 mt-3 text-[30px] font-semibold leading-[38px] text-white">
                  Thanks for your purchase,{" "}
                  {(order.user as { name?: string })?.name ??
                    order.shippingAddress.fullName}
                  .
                </Heading>
                <Text className="mb-0 mt-3 text-[15px] leading-[24px] text-slate-300">
                  We&apos;ve received your order and your payment has been
                  recorded. You can review your items, delivery details, and
                  payment summary anytime from your account.
                </Text>
                <Section className="pt-6">
                  <Button
                    className="rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-slate-950 no-underline"
                    href={orderUrl}
                  >
                    View order details
                  </Button>
                </Section>
              </Section>

              <Section className="px-8 py-8">
                <Section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <Row>
                    <Column>
                      <Text className="m-0 text-[12px] uppercase tracking-[0.12em] text-slate-500">
                        Order number
                      </Text>
                      <Text className="m-0 mt-2 text-[15px] font-semibold text-slate-900">
                        {order._id.toString()}
                      </Text>
                    </Column>
                    <Column>
                      <Text className="m-0 text-[12px] uppercase tracking-[0.12em] text-slate-500">
                        Ordered on
                      </Text>
                      <Text className="m-0 mt-2 text-[15px] font-semibold text-slate-900">
                        {dateFormatter.format(order.createdAt)}
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="m-0 text-[12px] uppercase tracking-[0.12em] text-slate-500">
                        Total paid
                      </Text>
                      <Text className="m-0 mt-2 text-[15px] font-semibold text-slate-900">
                        {formatCurrency(order.totalPrice)}
                      </Text>
                    </Column>
                  </Row>
                </Section>

                <Heading className="m-0 mt-8 text-[20px] font-semibold text-slate-950">
                  Items in your order
                </Heading>

                <Section className="mt-5 rounded-2xl border border-slate-200 px-5 py-2">
                  {order.items.map((item) => (
                    <Row
                      key={`${item.product}-${item.clientId}`}
                      className="border-b border-slate-200 py-4 last:border-b-0"
                    >
                      <Column width={88} className="align-top">
                        <Link href={`${site.url}/product/${item.slug}`}>
                          <Img
                            alt={item.name}
                            className="rounded-xl border border-slate-200 object-cover"
                            height="80"
                            src={
                              item.image.startsWith("/")
                                ? `${site.url}${item.image}`
                                : item.image
                            }
                            width="80"
                          />
                        </Link>
                      </Column>
                      <Column className="px-4 align-top">
                        <Link
                          className="text-[15px] font-semibold text-slate-900 no-underline"
                          href={`${site.url}/product/${item.slug}`}
                        >
                          {item.name}
                        </Link>
                        <Text className="m-0 mt-2 text-[14px] leading-[22px] text-slate-600">
                          Qty: {item.quantity}
                          {item.size ? ` • Size: ${item.size}` : ""}
                          {item.color ? ` • Color: ${item.color}` : ""}
                        </Text>
                      </Column>
                      <Column align="right" className="align-top">
                        <Text className="m-0 text-[15px] font-semibold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </Text>
                        <Text className="m-0 mt-2 text-[13px] text-slate-500">
                          {formatCurrency(item.price)} each
                        </Text>
                      </Column>
                    </Row>
                  ))}
                </Section>

                {order.coupon && (
                  <Section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                    <Text className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Coupon applied
                    </Text>
                    <Text className="m-0 mt-3 text-[24px] font-semibold text-emerald-950">
                      {order.coupon.code}
                    </Text>
                    <Text className="m-0 mt-2 text-[14px] leading-[22px] text-emerald-800">
                      {couponDescription}
                    </Text>
                    <Text className="m-0 mt-3 text-[14px] font-semibold text-emerald-950">
                      Discount saved: - {formatCurrency(Math.abs(order.coupon.discountAmount))}
                    </Text>
                  </Section>
                )}

                <Row className="mt-8">
                  <Column className="pr-3 align-top">
                    <Section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                      <Text className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Shipping address
                      </Text>
                      <Text className="m-0 mt-3 text-[14px] leading-[22px] text-slate-700">
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.street}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.province}{" "}
                        {order.shippingAddress.postalCode}
                        <br />
                        {order.shippingAddress.country}
                        <br />
                        {order.shippingAddress.phone}
                      </Text>
                    </Section>
                  </Column>
                  <Column className="pl-3 align-top">
                    <Section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                      <Text className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Payment summary
                      </Text>
                      <Text className="m-0 mt-3 text-[14px] leading-[22px] text-slate-700">
                        Method: {order.paymentMethod}
                      </Text>
                      {pricingRows.map((row) => (
                        <Row key={row.label} className="py-1.5">
                          <Column>
                            <Text
                              className={`m-0 text-[14px] ${row.isTotal ? "font-semibold text-slate-950" : "text-slate-600"}`}
                            >
                              {row.label}
                            </Text>
                          </Column>
                          <Column align="right">
                            <Text
                              className={`m-0 text-[14px] ${row.isDiscount ? "font-semibold text-emerald-600" : row.isTotal ? "font-semibold text-slate-950" : "text-slate-700"}`}
                            >
                              {row.value < 0
                                ? `- ${formatCurrency(Math.abs(row.value))}`
                                : formatCurrency(row.value)}
                            </Text>
                          </Column>
                        </Row>
                      ))}
                    </Section>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Section className="px-4 pb-4 pt-6 text-center">
              <Text className="m-0 text-[14px] leading-[22px] text-slate-600">
                Need help with your order? Visit our{" "}
                <Link
                  className="text-blue-600 underline"
                  href={`${site.url}/page/contact-us`}
                >
                  support page
                </Link>{" "}
                or reply to this email.
              </Text>
              <Section className="pt-5 text-center">
                <SocialLinks />
              </Section>
              <Text className="m-0 mt-4 text-[12px] text-slate-400">
                {site.name} • {site.copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
