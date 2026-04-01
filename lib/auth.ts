import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { passwordSchema } from "./validator";
import { getDb } from "./db/client";

import {
  sendChangeEmailVerification,
  sendResetPasswordEmail,
  sendVerifyEmail,
} from "./email/auth-emails";
import { sendAdminEventNotification } from "@/emails";

let authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

export function getAuth() {
  if (authPromise) return authPromise;

  authPromise = (async () => {
    const db = await getDb();

    return betterAuth({
      database: mongodbAdapter(db),
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
          strategy: "jwe",
          refreshCache: true,
        },
      },

      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },

      emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        autoSignIn: false,
        requireEmailVerification: true,

        async sendResetPassword({ user, url }) {
          await sendResetPasswordEmail({
            email: user.email,
            url,
          });
        },
      },

      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,

        async sendVerificationEmail({ user, url }) {
          await sendVerifyEmail({
            email: user.email,
            name: user.name,
            url,
          });
        },
      },

      user: {
        modelName: "users",

        changeEmail: {
          enabled: true,

          async sendChangeEmailVerification({ user, newEmail, url }) {
            await sendChangeEmailVerification({
              email: user.email,
              newEmail,
              url,
            });
          },
        },

        additionalFields: {
          role: {
            type: "string",
            input: false,
            defaultValue: "USER",
            options: ["USER", "ADMIN"],
          },

          wishlist: {
            type: "json",
            defaultValue: [],
          },
          addresses: {
            type: "json",
            input: false,
            defaultValue: [],
          },
        },
      },

      hooks: {
        before: createAuthMiddleware(async (ctx) => {
          if (
            ctx.path === "/sign-up/email" ||
            ctx.path === "/reset-password" ||
            ctx.path === "/change-password"
          ) {
            const password = ctx.body.password || ctx.body.newPassword;
            const { error } = passwordSchema.safeParse(password);

            if (error) {
              throw new APIError("BAD_REQUEST", {
                message: "Password not strong enough",
              });
            }
          }
        }),
      },

      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

              const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
              const addresses = Array.isArray(user.addresses) ? user.addresses : [];

              if (ADMIN_EMAILS.includes(user.email)) {
                return {
                  data: {
                    ...user,
                    role: "ADMIN",
                    wishlist,
                    addresses,
                  },
                };
              }

              return {
                data: {
                  ...user,
                  wishlist,
                  addresses,
                },
              };
            },
            after: async (user) => {
              if (user.role === "ADMIN") return;

              await sendAdminEventNotification({
                title: "New customer account",
                description: `${user.name || user.email} created an account${user.email ? ` with ${user.email}` : ""}.`,
                href: "/admin/users",
                meta: user.emailVerified ? "Email verified" : "Needs verification",
                createdAt: new Date().toISOString(),
              });
            },
          },
        },
      },

      account: {
        accountLinking: {
          enabled: true,
        },
      },
    });
  })();

  return authPromise;
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;


export type Session = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    wishlist?: unknown[];
    addresses?: unknown[];
  } | null;
};

export type User = NonNullable<Session["user"]>;
