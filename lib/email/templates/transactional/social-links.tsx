import { Section, Row, Column, Link, Img } from "@react-email/components";

const socialLinks = {
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
};

export default function SocialLinks() {
  const socialPlatforms = [
    {
      name: "Facebook",
      icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
      url: socialLinks.facebook,
    },
    {
      name: "Instagram",
      icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
      url: socialLinks.instagram,
    },
    {
      name: "Twitter",
      icon: "https://cdn-icons-png.flaticon.com/512/3256/3256013.png",
      url: socialLinks.twitter,
    },
    {
      name: "Tiktok",
      icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
      url: socialLinks.tiktok,
    },
  ];

  return (
    <Section className="mt-4 text-center">
      <Row className="inline-block">
        {socialPlatforms.map((platform) => (
          <Column key={platform.name} className="px-2">
            <Link href={platform.url}>
              <Img
                src={platform.icon}
                width="24"
                height="24"
                alt={platform.name}
              />
            </Link>
          </Column>
        ))}
      </Row>
    </Section>
  );
}
