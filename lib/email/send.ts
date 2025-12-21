import { resend } from "./resend";
import { SENDER_EMAIL, SENDER_NAME } from "@/lib/constants";

type SendEmailProps = {
  to: string;
  subject: string;
  react: React.ReactElement;
  scheduledAt?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  scheduledAt,
}: SendEmailProps) {
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to,
    subject,
    react,
    scheduledAt,
  });
}
