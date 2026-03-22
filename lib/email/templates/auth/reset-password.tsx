import AuthEmailLayout from "./auth-email-layout";

type Props = {
  resetLink: string;
};

export default async function ResetPasswordEmail({ resetLink }: Props) {
  return (
    <AuthEmailLayout
      ctaLabel="Reset password"
      ctaUrl={resetLink}
      greeting="Hi there,"
      intro="We received a request to reset the password for your account. Use the secure link below to choose a new password."
      note="If you did not request a password reset, no action is required. Your current password will remain unchanged until a new one is created."
      outro="For best security, choose a unique password you do not use on any other website or app."
      preview="Reset your password with this secure link"
      title="Reset your password"
    />
  );
}
