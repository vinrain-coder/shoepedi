import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type WelcomeNewUserEmailProps = {
  name?: string | null;
  siteName: string;
  siteUrl: string;
  siteCopyright: string;
  firstPurchaseDiscountRate?: number;
};

export default function WelcomeNewUserEmail({
  name,
  siteName,
  siteUrl,
  siteCopyright,
  firstPurchaseDiscountRate = 20,
}: WelcomeNewUserEmailProps) {
  const customerName = name?.trim() || "there";

  return (
    <Html>
      <Head />
      <Preview>Welcome to {siteName}! Your account is ready.</Preview>
      <Tailwind>
        <Body className="font-sans bg-slate-50 text-slate-900 py-8">
          <Container className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <Heading className="text-2xl font-bold mb-6 text-center">
              Welcome to {siteName} 👋
            </Heading>

            <Text className="text-base text-slate-700 mb-4">Hi {customerName},</Text>
            <Text className="text-slate-600 leading-relaxed mb-6">
              Thanks for joining {siteName}. Your account is all set—start exploring our collection, save favorites, and track your orders from one place.
            </Text>
            <Text className="text-slate-700 leading-relaxed mb-6">
              🎉 As a new customer, you can get up to {firstPurchaseDiscountRate}% off your first purchase at checkout.
            </Text>

            <Section className="text-center my-8">
              <Button
                href={`${siteUrl}/account`}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Go to my account
              </Button>
            </Section>

            <Text className="text-slate-600 leading-relaxed">
              Need help? Just reply to this email and our team will gladly assist you.
            </Text>

            <Text className="text-xs text-slate-400 mt-8 text-center">
              &copy; {new Date().getFullYear()} {siteName}. {siteCopyright}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
