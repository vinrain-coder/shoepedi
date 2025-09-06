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

type PasswordResetEmailProps = {
  resetLink: string;
  siteName: string;
  siteUrl: string;
  siteCopyright: string;
  siteLogo: string;
};

export default function PasswordResetEmail({
  resetLink,
  siteName,
  siteUrl,
  siteCopyright,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Preview>{`Reset your password - ${siteName}`}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-100">
          <Container className="max-w-lg bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <Heading className="text-2xl font-bold text-center text-gray-900">
              Reset Your Password
            </Heading>

            <Section className="text-center">
              <Text className="text-gray-700 text-lg">
                You recently requested to reset your password for your{" "}
                {siteName} account.
              </Text>
              <Text className="text-gray-700">
                Click the button below to reset your password. This link will
                expire in 15 minutes.
              </Text>

              {/* Reset Password Button */}
              <Button
                href={resetLink}
                className="bg-orange-500 text-white px-6 py-3 mt-4 rounded-lg text-xl font-bold shadow-md transition"
              >
                Reset Password
              </Button>

              <Text className="text-gray-600 mt-4">
                If you didn’t request this, you can ignore this email.
              </Text>
            </Section>

            {/* Footer */}
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
