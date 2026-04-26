import {
  Body,
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

import { getSetting } from "@/lib/actions/setting.actions";
import { formatCurrency } from "@/lib/utils";
import SocialLinks from "./social-links";

type ReceiptEmailOrder = {
  _id: { toString(): string } | string;
  createdAt: Date | string;
  isPaid: boolean;
  paidAt?: Date | string;
  totalPrice: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  coupon?: {
    code: string;
    discountType: "percentage" | "fixed";
    discountAmount: number;
  };
  user?: {
    name?: string;
    email?: string;
  } | { toString(): string };
  paymentMethod: string;
  paymentResult?: Record<string, unknown>;
  expectedDeliveryDate?: Date | string;
  isDelivered?: boolean;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    province: string;
  };
  items: Array<{
    clientId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    product: { toString(): string } | string;
    slug: string;
    category: string;
    countInStock: number;
  }>;
};

type OrderInformationProps = {
  order: ReceiptEmailOrder;
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
    createdAt: new Date(),
    paymentMethod: "Card",
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const getCouponDescription = (order: ReceiptEmailOrder) => {
  if (!order.coupon) return null;

  return order.coupon.discountType === "percentage"
    ? "Percentage discount applied to your items subtotal"
    : `${formatCurrency(order.coupon.discountAmount)} saved on this order`;
};

export default async function PurchaseReceiptEmail({
  order,
}: OrderInformationProps) {
  const { site } = await getSetting();
  const couponDescription = getCouponDescription(order);
  const paymentResult = order.paymentResult ?? {};
  const gateway =
    typeof paymentResult.gateway === "string"
      ? paymentResult.gateway
      : "paystack";
  const reference =
    typeof paymentResult.paymentReference === "string"
      ? paymentResult.paymentReference
      : "-";
  const transactionId =
    typeof paymentResult.id === "string" ? paymentResult.id : "-";
  const channel =
    typeof paymentResult.channel === "string" ? paymentResult.channel : "-";
  const currency =
    typeof paymentResult.currency === "string" ? paymentResult.currency : "-";

  return (
    <Html>
      <Preview>{`Receipt for order ${order._id.toString()}`}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-slate-100 text-slate-800 py-8">
          <Container className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-7">
            {/* Header */}
            <Section className="rounded-2xl bg-slate-950 p-6 text-center">
              <Heading className="m-0 text-3xl font-bold text-white">
                Purchase Receipt
              </Heading>
              <Text className="m-0 mt-2 text-slate-300">
                Thank you for shopping with us.
              </Text>
            </Section>

            {/* Order Info */}
            <Section className="border border-slate-200 rounded-xl p-4 my-6 bg-slate-50">
              <Row className="flex flex-wrap justify-between">
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-slate-500">Order ID</Text>
                  <Text className="font-semibold">{order._id.toString()}</Text>
                </Column>
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-slate-500">Purchased On</Text>
                  <Text className="font-semibold">
                    {dateFormatter.format(new Date(order.createdAt))}
                  </Text>
                </Column>
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-slate-500">Price Paid</Text>
                  <Text className="font-semibold">{formatCurrency(order.totalPrice)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Items List */}
            <Section className="border border-slate-200 rounded-xl p-4 my-6 bg-slate-50">
              {order.items.map((item) => (
                <Row
                  key={String(item.product)}
                  className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0"
                >
                  <Column className="w-20">
                    <Link href={`${site.url}/product/${item.slug}`}>
                      <Img
                        width="80"
                        alt={item.name}
                        className="rounded-lg shadow-sm"
                        src={
                          item.image.startsWith("/")
                            ? `${site.url}${item.image}`
                            : item.image
                        }
                      />
                    </Link>
                  </Column>
                  <Column className="flex-1 text-left px-4">
                    <Link href={`${site.url}/product/${item.slug}`}>
                      <Text className="font-semibold">{item.name}</Text>
                    </Link>
                    <Text className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="font-semibold">
                      {formatCurrency(item.price)}
                    </Text>
                  </Column>
                </Row>
              ))}

              {/* Pricing Breakdown */}
              {order.coupon && (
                <Section className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Coupon applied
                  </Text>
                  <Text className="m-0 mt-2 text-lg font-bold text-emerald-900">
                    {order.coupon.code}
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-emerald-800">
                    {couponDescription}
                  </Text>
                  <Text className="m-0 mt-2 text-sm font-semibold text-emerald-900">
                    Discount: -{formatCurrency(Math.abs(order.coupon.discountAmount))}
                  </Text>
                </Section>
              )}

              <Section className="mt-4">
                {[
                  { name: "Items", price: order.itemsPrice },
                  { name: "Tax", price: order.taxPrice },
                  { name: "Shipping", price: order.shippingPrice },
                  ...(order.coupon
                    ? [{ name: `Coupon (${order.coupon.code})`, price: -Math.abs(order.coupon.discountAmount) }]
                    : []),
                  { name: "Total", price: order.totalPrice },
                ].map(({ name, price }) => (
                  <Row key={name} className="flex justify-between py-1">
                    <Column className="font-semibold">{name}:</Column>
                    <Column align="right">
                      <Text className="m-0">
                        {price < 0
                          ? `-${formatCurrency(Math.abs(price))}`
                          : formatCurrency(price)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </Section>

            {/* Payment & Shipping Info */}
            <Section className="border border-slate-200 rounded-xl p-4 my-6 bg-slate-50">
              <Heading className="text-lg font-semibold">
                Shipping Address
              </Heading>
              <Text className="text-gray-600">
                {order.shippingAddress.fullName}
              </Text>
              <Text className="text-gray-600">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.province},{" "}
                {order.shippingAddress.country}
              </Text>
              <Text className="text-gray-600">
                Phone: {order.shippingAddress.phone}
              </Text>

              <Heading className="text-lg font-semibold mt-4">
                Payment Method
              </Heading>
              <Text className="text-slate-600">{order.paymentMethod}</Text>
              {order.paymentResult && (
                <Text className="text-slate-600">
                  Gateway: {gateway}
                  <br />
                  Reference: {reference}
                  <br />
                  Transaction ID: {transactionId}
                  <br />
                  Channel: {channel}
                  <br />
                  Currency: {currency}
                </Text>
              )}
              <Text className="text-slate-500 text-sm mt-2">
                A PDF receipt is attached to this email.
              </Text>
            </Section>

            {/* Thank You & Footer */}
            <Section className="text-center py-6 border-t">
              <Text className="text-slate-700 font-medium">
                Thank you for shopping with us!
              </Text>
              <Text className="text-slate-500 text-sm">
                If you have any questions, feel free to{" "}
                <Link
                  href={`${site.url}/page/contact-us`}
                  className="text-indigo-600"
                >
                  contact us
                </Link>
                .
              </Text>
              <Section className="text-center mt-4">
                <SocialLinks />
              </Section>
              <Text className="text-slate-400 text-xs mt-4">
                {site.name} • {site.copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
