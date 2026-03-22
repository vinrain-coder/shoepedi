import AuthEmailLayout from "./auth-email-layout";

type Props = {
  newEmail: string;
  url: string;
};

export default async function ChangeEmailEmail({ newEmail, url }: Props) {
  return (
    <AuthEmailLayout
      ctaLabel="Approve email change"
      ctaUrl={url}
      greeting="Hi there,"
      intro={`We received a request to change the email on your account to ${newEmail}. Confirm this change to continue.`}
      note="If you did not request this update, do not approve it. We recommend reviewing your account security and changing your password immediately."
      outro="Approving this request will update the email address used to sign in and receive account notifications."
      preview="Confirm the new email address for your account"
      title="Confirm your new email address"
    />
  );
}
