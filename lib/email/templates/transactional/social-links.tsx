import { Section, Row, Column, Link, Img } from "@react-email/components";

export default function SocialLinks() {
  const socialPlatforms = [
    {
      name: "Facebook",
      icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
      url: "https://facebook.com/shoepedi",
    },
    {
      name: "Instagram",
      icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
      url: "https://instagram.com/shoepedi",
    },
    {
      name: "Twitter",
      icon: "https://cdn-icons-png.flaticon.com/512/3256/3256013.png",
      url: "https://twitter.com/shoepedi",
    },
    {
      name: "Tiktok",
      icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
      url: "https://tiktok.com/@shoepedi",
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
