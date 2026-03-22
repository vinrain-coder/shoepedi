import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type AdminEventNotificationEmailProps = {
  title: string;
  description: string;
  href: string;
  meta?: string;
  createdAt: string;
  siteName: string;
  siteUrl: string;
};

export default function AdminEventNotificationEmail({
  title,
  description,
  href,
  meta,
  createdAt,
  siteName,
  siteUrl,
}: AdminEventNotificationEmailProps) {
  const absoluteHref = href.startsWith("http") ? href : `${siteUrl}${href}`;

  return (
    <Html>
      <Head />
      <Preview>{`${title} - ${siteName} admin alert`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New admin notification</Heading>
          <Text style={paragraph}>
            A new event was added to your {siteName} admin notification feed.
          </Text>

          <Section style={card}>
            <Text style={label}>Event</Text>
            <Text style={value}>{title}</Text>

            <Text style={label}>Details</Text>
            <Text style={value}>{description}</Text>

            {meta ? (
              <>
                <Text style={label}>Status</Text>
                <Text style={value}>{meta}</Text>
              </>
            ) : null}

            <Text style={label}>Time</Text>
            <Text style={value}>{new Date(createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</Text>
          </Section>

          <Button href={absoluteHref} style={button}>
            View in admin panel
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            If the button does not work, copy and paste this link into your browser:
          </Text>
          <Link href={absoluteHref} style={link}>
            {absoluteHref}
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "32px",
};

const heading = {
  color: "#111827",
  fontSize: "24px",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
};

const card = {
  backgroundColor: "#f9fafb",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "24px",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "700",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#111827",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700",
  padding: "12px 20px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const link = {
  color: "#2563eb",
  fontSize: "12px",
  textDecoration: "underline",
};
