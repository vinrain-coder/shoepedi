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
  name?: string;
  url: string;
};

export default function VerifyEmail({ name, url }: Props) {
  return (
    <Html>
      <Preview>Verify your email address</Preview>
      <Head />
      <Body className="bg-gray-100 font-sans">
        <Container className="bg-white p-6 rounded-lg shadow">
          <Heading>Verify your email</Heading>
          <Text>Hello {name ?? "there"},</Text>
          <Text>
            Please confirm your email address to activate your account.
          </Text>
          <Button href={url} className="bg-black text-white px-4 py-2 rounded">
            Verify Email
          </Button>
          <Text className="text-sm text-gray-500 mt-4">
            If you didn’t request this, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
