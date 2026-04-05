import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type NewsletterConfirmationEmailProps = {
  email: string;
  unsubscribeLink: string;
  siteName: string;
  siteUrl: string;
  siteCopyright: string;
};

export default function NewsletterConfirmationEmail({
  email,
  unsubscribeLink,
  siteName,
  siteUrl,
  siteCopyright,
}: NewsletterConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the {siteName} Newsletter!</Preview>
      <Tailwind>
        <Body className="font-sans bg-slate-50 text-slate-900 py-8">
          <Container className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <Heading className="text-2xl font-bold text-center mb-6">
              You&apos;re officially on the list! 🎉
            </Heading>

            <Text className="text-lg mb-4 text-slate-700">
              Hello,
            </Text>

            <Text className="mb-6 leading-relaxed text-slate-600">
              Thank you for subscribing to the <strong>{siteName}</strong> newsletter. We&apos;re excited to have you with us!
            </Text>

            <Section className="bg-slate-50 rounded-xl p-6 mb-8 text-center border border-slate-100">
              <Text className="m-0 text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">
                Subscribed Email
              </Text>
              <Text className="m-0 text-xl font-bold text-slate-900">
                {email}
              </Text>
            </Section>

            <Text className="mb-8 leading-relaxed text-slate-600 text-center">
              You&apos;ll be the first to know about our new arrivals, exclusive offers, and the latest trends in footwear.
            </Text>

            <Hr className="border-slate-100 my-8" />

            <Section className="text-center">
              <Text className="text-xs text-slate-400 mb-4">
                You are receiving this email because you subscribed to our newsletter at <Link href={siteUrl} className="text-slate-400 underline">{siteUrl}</Link>.
              </Text>
              <Text className="text-xs text-slate-400">
                If you didn&apos;t mean to subscribe, you can <Link href={unsubscribeLink} className="text-blue-500 underline font-medium">unsubscribe here</Link> at any time.
              </Text>
              <Text className="text-xs text-slate-400 mt-6">
                &copy; {new Date().getFullYear()} {siteName}. {siteCopyright}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
