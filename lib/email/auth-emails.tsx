import { sendEmail } from "./send";
import VerifyEmail from "./templates/auth/verify-email";
import ResetPasswordEmail from "./templates/auth/reset-password";
import ChangeEmailEmail from "./templates/auth/change-email";

export async function sendVerifyEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string;
  url: string;
}) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    react: <VerifyEmail name={name} url={url} />,
  });
}

export async function sendResetPasswordEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  await sendEmail({
    to: email,
    subject: "Reset your password",
    react: <ResetPasswordEmail resetLink={url} />,
  });
}

export async function sendChangeEmailVerification({
  email,
  newEmail,
  url,
}: {
  email: string;
  newEmail: string;
  url: string;
}) {
  await sendEmail({
    to: email,
    subject: "Approve email change",
    react: <ChangeEmailEmail newEmail={newEmail} url={url} />,
  });
}
