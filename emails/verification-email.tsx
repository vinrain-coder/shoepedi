import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type EmailVerificationEmailProps = {
  verificationLink: string;
  siteName: string;
  siteUrl: string;
  siteCopyright: string;
};

export default function EmailVerificationEmail({
  verificationLink,
  siteName,
  siteUrl,
  siteCopyright,
}: EmailVerificationEmailProps) {
  return (
    <Html>
      <Preview>{`Verify your email - ${siteName}`}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-100">
          <Container className="max-w-lg bg-white rounded-lg shadow-lg p-6">
            <Heading className="text-2xl font-bold text-center text-gray-900">
              Verify Your Email Address
            </Heading>
            <Section className="text-center">
              <Text className="text-gray-700 text-lg">
                You recently registered an account with {siteName}.
              </Text>
              <Text className="text-gray-700">
                To complete your registration, please verify your email address
                by clicking the button below.
              </Text>

              {/* Magic Link Button */}
              <Button
                href={verificationLink}
                className="bg-orange-500 text-white px-6 py-3 mt-4 rounded-lg text-xl font-bold shadow-md transition"
              >
                Verify Email
              </Button>

              <Text className="text-gray-600 mt-4">
                If you didn’t register for an account, you can ignore this
                email.
              </Text>
            </Section>
            <Section className="mt-8 text-center border-t pt-4">
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
