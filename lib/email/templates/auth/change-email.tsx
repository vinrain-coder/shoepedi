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
  newEmail: string;
  url: string;
};

export default function ChangeEmailEmail({ newEmail, url }: Props) {
  return (
    <Html>
      <Preview>Approve email change</Preview>
      <Head />
      <Body className="bg-gray-100 font-sans">
        <Container className="bg-white p-6 rounded-lg shadow">
          <Heading>Email Change Request</Heading>
          <Text>
            You requested to change your email to <b>{newEmail}</b>.
          </Text>
          <Button href={url} className="bg-black text-white px-4 py-2 rounded">
            Approve Change
          </Button>
          <Text className="text-sm text-gray-500 mt-4">
            If this wasn’t you, secure your account immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
