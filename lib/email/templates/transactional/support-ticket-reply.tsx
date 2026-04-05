import * as React from "react";

type SupportTicketReplyEmailProps = {
  customerName: string;
  subject: string;
  originalMessage: string;
  replyMessage: string;
};

export default function SupportTicketReplyEmail({
  customerName,
  subject,
  originalMessage,
  replyMessage,
}: SupportTicketReplyEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111827" }}>
      <h2>Customer Support Reply</h2>
      <p>Hi {customerName},</p>
      <p>We have responded to your support request.</p>
      <p>
        <strong>Subject:</strong> {subject}
      </p>
      <p>
        <strong>Your message:</strong>
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{originalMessage}</p>
      <p>
        <strong>Our response:</strong>
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{replyMessage}</p>
      <p>Thank you for reaching out to us.</p>
    </div>
  );
}
