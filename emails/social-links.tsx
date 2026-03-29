import { Img, Link, Section, Text } from "@react-email/components";

const socials = [
  {
    key: "instagram",
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    icon: "https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    icon: "https://img.icons8.com/?size=100&id=118640&format=png&color=000000",
  },
  {
    key: "facebook",
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    icon: "https://img.icons8.com/?size=100&id=118497&format=png&color=000000",
  },
  {
    key: "x",
    label: "X",
    href: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
    icon: "https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000",
  },
];

export default function SocialLinks() {
  return (
    <Section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <Text className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Stay connected
      </Text>
      <Text className="m-0 mt-2 text-[14px] text-slate-700">
        Follow us for latest drops, flash sales, and styling tips.
      </Text>
      <Section
        style={{
          marginTop: "14px",
          textAlign: "center",
        }}
      >
        {socials.map((social) => (
          <Link
            key={social.key}
            href={social.href}
            target="_blank"
            style={{
              display: "inline-block",
              margin: "0 8px",
              padding: "8px",
              borderRadius: "999px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <Img
              src={social.icon}
              alt={social.label}
              width="20"
              height="20"
              style={{ display: "block" }}
            />
          </Link>
        ))}
      </Section>
    </Section>
  );
}
