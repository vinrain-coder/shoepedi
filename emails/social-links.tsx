import { Img, Link, Section, Text } from "@react-email/components";

export default function SocialLinks() {
  const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "#";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";

  return (
    <Section className="text-center mt-4">
      <Text className="font-semibold text-gray-500 text-md">
        Follow us for the latest drops & deals:
      </Text>
      <Section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px", // Increased gap for better spacing
          marginTop: "10px",
        }}
      >
        <Link href={instagramUrl} target="_blank">
          <Img
            src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000"
            alt="Instagram"
            width="32"
            height="32"
          />
        </Link>
        <Link href={tiktokUrl} target="_blank">
          <Img
            src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000"
            alt="TikTok"
            width="32"
            height="32"
          />
        </Link>
        <Link href={facebookUrl} target="_blank">
          <Img
            src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
            alt="Facebook"
            width="32"
            height="32"
          />
        </Link>
        <Link href={twitterUrl} target="_blank">
          <Img
            src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000"
            alt="X/Twitter"
            width="32"
            height="32"
          />
        </Link>
      </Section>
    </Section>
  );
}
