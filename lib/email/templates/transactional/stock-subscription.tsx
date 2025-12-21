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
import { IProduct } from "@/lib/db/models/product.model";
import SocialLinks from "./social-links";

type StockSubscriptionEmailProps = {
  product: IProduct;
  email: string;
  siteUrl: string;
  siteName: string;
  siteCopyright: string;
};

export default function StockSubscriptionNotificationEmail({
  product,
  // email,
  siteUrl,
  siteName,
  siteCopyright,
}: StockSubscriptionEmailProps) {
  if (!product) {
    return (
      <Text>
        Unfortunately, the product is no longer available for notification.
      </Text>
    );
  }

  return (
    <Html>
      <Preview>{`"${product.name}" is back in stock!`}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-100">
          <Container className="max-w-xl bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <Heading className="text-2xl font-bold text-center text-gray-900">
              {`"${product.name}" is back in stock!`}
            </Heading>

            {/* Product Details Section */}
            <Section className="text-center">
              <Row>
                <Column>
                  <Link href={`${siteUrl}/product/${product.slug}`}>
                    <Img
                      width="200"
                      alt={product.name}
                      className="rounded-lg mx-auto shadow-md"
                      src={
                        product.images[0] || "https://via.placeholder.com/200"
                      }
                    />
                  </Link>
                </Column>
              </Row>

              <Text className="text-gray-700 mt-4 text-lg">
                The product you subscribed to is now available. Don’t miss out
                before it sells out again!
              </Text>

              {/* Price & Stock Information */}
              <Text className="text-xl font-semibold text-gray-900 mt-2">
                Price:{" "}
                <span className="text-green-600">
                  KES {product.price.toFixed(2)}
                </span>
              </Text>
              <Text className="text-md text-gray-600 mt-1">
                {product.countInStock > 0 ? (
                  <span className="text-green-500 font-medium">
                    In Stock: {product.countInStock} products as of{" "}
                    {new Date().toLocaleString()}
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </Text>

              {/* Buy Now Button */}
              <Button
                href={`${siteUrl}/product/${product.slug}`}
                className="bg-orange-500 text-white px-6 py-3 mt-6 rounded-xl text-lg font-bold shadow-md transition"
              >
                Buy Now
              </Button>
            </Section>

            {/* Footer */}
            <Section className="mt-8 text-center border-t pt-4">
              <Text className="text-gray-500 text-sm">
                You received this email because you subscribed to be notified
                when this product is back in stock.
              </Text>
              {/* <Text className="text-gray-500 text-sm">
                  If you no longer wish to receive these notifications, you can{" "}
                  <Link
                    href={`${siteUrl}/unsubscribe?email=${email}&product=${product._id}`}
                    className="text-blue-600 font-medium underline"
                  >
                    unsubscribe here
                  </Link>
                  .
                </Text> */}
              <Text className="text-gray-500 text-sm">
                If you have any questions, feel free to{" "}
                <Link
                  href={`${siteUrl}/page/contact-us`}
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
                {siteName} . {siteCopyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
  }
