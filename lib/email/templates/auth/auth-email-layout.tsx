import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { getSetting } from "@/lib/actions/setting.actions";

type AuthEmailLayoutProps = {
  preview: string;
  title: string;
  greeting: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  note?: string;
  outro?: string;
  supportText?: string;
};

export default async function AuthEmailLayout({
  preview,
  title,
  greeting,
  intro,
  ctaLabel,
  ctaUrl,
  note,
  outro,
  supportText,
}: AuthEmailLayoutProps) {
  const { site } = await getSetting();
  const supportLine =
    supportText ??
    `If you need help, reply to this email or contact ${site.email}.`;
  const logoSrc = site.logo.startsWith("/")
    ? `${site.url}${site.logo}`
    : site.logo;

  return (
    <Html>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Head />
        <Body className="m-0 bg-slate-100 py-10 font-sans text-slate-900">
          <Container className="mx-auto max-w-[600px] px-4">
            <Section className="overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <Section className="bg-slate-950 px-8 py-6 text-center">
                <Img
                  alt={site.name}
                  className="mx-auto max-h-10 w-auto"
                  src={logoSrc}
                />
                <Text className="m-0 mt-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                  Secure account access
                </Text>
              </Section>

              <Section className="px-8 py-10">
                <Heading className="m-0 text-[28px] font-semibold leading-[36px] text-slate-950">
                  {title}
                </Heading>
                <Text className="mb-0 mt-6 text-[16px] leading-[26px] text-slate-700">
                  {greeting}
                </Text>
                <Text className="mb-0 mt-4 text-[16px] leading-[26px] text-slate-700">
                  {intro}
                </Text>

                <Section className="py-8 text-center">
                  <Button
                    className="rounded-xl bg-slate-950 px-6 py-4 text-[15px] font-semibold text-white no-underline"
                    href={ctaUrl}
                  >
                    {ctaLabel}
                  </Button>
                </Section>

                <Section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <Text className="m-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Security note
                  </Text>
                  <Text className="m-0 mt-2 text-[14px] leading-[22px] text-slate-600">
                    {note ??
                      "For your security, this link can only be used for the intended account action and may expire after a limited time."}
                  </Text>
                </Section>

                {outro ? (
                  <Text className="mb-0 mt-6 text-[15px] leading-[24px] text-slate-600">
                    {outro}
                  </Text>
                ) : null}

                <Text className="mb-0 mt-6 text-[15px] leading-[24px] text-slate-600">
                  If the button does not work, copy and paste this link into
                  your browser:
                </Text>
                <Link
                  className="mt-3 block break-all text-[14px] leading-[22px] text-blue-600 underline"
                  href={ctaUrl}
                >
                  {ctaUrl}
                </Link>
              </Section>
            </Section>

            <Section className="px-4 pb-2 pt-6">
              <Hr className="border-slate-200" />
              <Text className="mb-0 mt-6 text-center text-[13px] leading-[21px] text-slate-500">
                {supportLine}
              </Text>
              <Text className="mb-0 mt-2 text-center text-[12px] leading-[20px] text-slate-400">
                © {new Date().getFullYear()} {site.name}. {site.address}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
