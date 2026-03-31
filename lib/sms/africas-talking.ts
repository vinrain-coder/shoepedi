import { getSetting } from "@/lib/actions/setting.actions";

type SmsDispatchResult = {
  success: boolean;
  message: string;
};

const parseRecipients = (input: string | undefined | null) =>
  (input ?? "")
    .split(/[;,]/)
    .map((value) => value.trim())
    .filter(Boolean);

const postSms = async ({
  username,
  apiKey,
  sandboxMode,
  senderId,
  recipients,
  message,
}: {
  username: string;
  apiKey: string;
  sandboxMode: boolean;
  senderId?: string;
  recipients: string[];
  message: string;
}) => {
  const endpoint = sandboxMode
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

  const body = new URLSearchParams({
    username,
    to: recipients.join(","),
    message,
  });

  if (senderId) {
    body.set("from", senderId);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Africa's Talking SMS failed: ${response.status} ${details}`);
  }

  return response.json();
};

export async function sendAfricasTalkingSms({
  to,
  message,
}: {
  to: string | string[];
  message: string;
}): Promise<SmsDispatchResult> {
  const { notifications } = await getSetting();
  const smsConfig = notifications?.sms;

  if (!smsConfig?.enabled) {
    return { success: true, message: "SMS is disabled in settings." };
  }

  const recipients = Array.isArray(to)
    ? to.map((entry) => entry.trim()).filter(Boolean)
    : parseRecipients(to);

  if (recipients.length === 0) {
    return { success: true, message: "No SMS recipients resolved." };
  }

  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username =
    process.env.AFRICASTALKING_USERNAME || smsConfig.username || "sandbox";
  const sandboxMode =
    process.env.AFRICASTALKING_SANDBOX_MODE === "false"
      ? false
      : smsConfig.sandboxMode;

  if (!apiKey) {
    return {
      success: false,
      message: "AFRICASTALKING_API_KEY is not configured.",
    };
  }

  if (sandboxMode) {
    console.log(
      `[SMS][Sandbox] Would send to ${recipients.join(", ")}: ${message}`
    );
    return {
      success: true,
      message: "Sandbox mode enabled. SMS logged only.",
    };
  }

  await postSms({
    username,
    apiKey,
    sandboxMode,
    senderId: smsConfig.senderId || undefined,
    recipients,
    message,
  });

  return { success: true, message: "SMS sent successfully." };
}

export const getAdminSmsRecipients = async () => {
  const { notifications } = await getSetting();
  const fromSettings = parseRecipients(notifications?.sms?.adminRecipients);
  const fromEnv = parseRecipients(process.env.ADMIN_PHONE_NUMBERS);

  return [...new Set([...fromSettings, ...fromEnv])];
};
