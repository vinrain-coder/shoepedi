import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Preview,
} from "@react-email/components";

type Props = {
  resetLink: string;
};

export default function ResetPasswordEmail({ resetLink }: Props) {
  return (
    <Html>
      <Preview>Reset your password</Preview>
      <Head />
      <Body className="bg-gray-100 font-sans">
        <Container className="bg-white p-6 rounded-lg shadow">
          <Heading>Password Reset</Heading>
          <Text>We received a request to reset your password.</Text>
          <Button
            href={resetLink}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Reset Password
          </Button>
          <Text className="text-sm text-gray-500 mt-4">
            This link expires soon. If you didn’t request it, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
