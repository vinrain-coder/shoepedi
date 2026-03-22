import AuthEmailLayout from "./auth-email-layout";

type Props = {
  name?: string;
  url: string;
};

export default async function VerifyEmail({ name, url }: Props) {
  return (
    <AuthEmailLayout
      ctaLabel="Verify email address"
      ctaUrl={url}
      greeting={`Hi ${name ?? "there"},`}
      intro="Thanks for creating your account. Confirm your email address to activate your account and start shopping securely."
      note="This verification link is tied to your account and helps us protect your sign-in experience. If you did not create an account, you can safely ignore this email."
      preview="Confirm your email address to finish setting up your account"
      title="Verify your email address"
    />
  );
}
