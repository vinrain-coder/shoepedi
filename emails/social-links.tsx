import { Img, Link, Section, Text } from "@react-email/components";

export default function SocialLinks() {
  const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "#";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  return (
    <Section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
      <Text className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Follow us for the latest drops & deals
      </Text>
      <Section style={{ marginTop: "12px" }}>
        <Link
          href={instagramUrl}
          target="_blank"
          style={{
            display: "inline-block",
            marginRight: "10px",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            padding: "8px",
          }}
        >
          <Img
            src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000"
            alt="Instagram"
            width="20"
            height="20"
          />
        </Link>
        <Link
          href={tiktokUrl}
          target="_blank"
          style={{
            display: "inline-block",
            marginRight: "10px",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            padding: "8px",
          }}
        >
          <Img
            src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000"
            alt="TikTok"
            width="20"
            height="20"
          />
        </Link>
        <Link
          href={facebookUrl}
          target="_blank"
          style={{
            display: "inline-block",
            marginRight: "10px",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            padding: "8px",
          }}
        >
          <Img
            src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
            alt="Facebook"
            width="20"
            height="20"
          />
        </Link>
        <Link
          href={twitterUrl}
          target="_blank"
          style={{
            display: "inline-block",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            padding: "8px",
          }}
        >
          <Img
            src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000"
            alt="X/Twitter"
            width="20"
            height="20"
          />
        </Link>
      </Section>
    </Section>
  );
}
