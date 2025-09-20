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

export default async function PurchaseReceiptEmail({
  order,
}: OrderInformationProps) {
  const { site } = await getSetting();

  return (
    <Html>
      <Preview>Your Purchase Receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-100 text-gray-800">
          <Container className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <Heading className="text-3xl font-bold text-center text-gray-900">
              Purchase Receipt
            </Heading>

            {/* Order Info */}
            <Section className="border border-gray-200 rounded-lg p-4 my-6 bg-gray-50">
              <Row className="flex flex-wrap justify-between">
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-gray-500">Order ID</Text>
                  <Text className="font-semibold">{order._id.toString()}</Text>
                </Column>
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-gray-500">Purchased On</Text>
                  <Text className="font-semibold">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column className="w-full sm:w-1/3 mb-4">
                  <Text className="text-gray-500">Price Paid</Text>
                  <Text className="font-semibold">
                    KES.{formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Items List */}
            <Section className="border border-gray-200 rounded-lg p-4 my-6 bg-gray-50">
              {order.items.map((item) => (
                <Row
                  key={item.product}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
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
                      KES.{formatCurrency(item.price)}
                    </Text>
                  </Column>
                </Row>
              ))}

              {/* Pricing Breakdown */}
              <Section className="mt-4">
                {[
                  { name: "Items", price: order.itemsPrice },
                  { name: "Tax", price: order.taxPrice },
                  { name: "Shipping", price: order.shippingPrice },
                  { name: "Total", price: order.totalPrice },
                ].map(({ name, price }) => (
                  <Row key={name} className="flex justify-between py-1">
                    <Column className="font-semibold">{name}:</Column>
                    <Column align="right">
                      <Text className="m-0">KES.{formatCurrency(price)}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </Section>

            {/* Payment & Shipping Info */}
            <Section className="border border-gray-200 rounded-lg p-4 my-6 bg-gray-50">
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
              <Text className="text-gray-600">{order.paymentMethod}</Text>
            </Section>

            {/* Thank You & Footer */}
            <Section className="text-center py-6 border-t">
              <Text className="text-gray-700 font-medium">
                Thank you for shopping with us!
              </Text>
              <Text className="text-gray-500 text-sm">
                If you have any questions, feel free to{" "}
                <Link
                  href={`${site.url}/page/contact-us`}
                  className="text-blue-600"
                >
                  contact us
                </Link>
                .
              </Text>
              <Section className="text-center mt-4">
                <SocialLinks />
              </Section>
              <Text className="text-gray-400 text-xs mt-4">
                {site.name} . {site.copyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
