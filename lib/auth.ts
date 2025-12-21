import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { sendEmail } from "./email";
import { passwordSchema } from "./validator";
import { getDb } from "./db/client";

import {
  sendChangeEmailVerification,
  sendResetPasswordEmail,
  sendVerifyEmail,
} from "./email/auth-emails";

const db = await getDb();

export const auth = betterAuth({
  database: mongodbAdapter(db),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      strategy: "jwe",
      refreshCache: true,
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
          const ADMIN_EMAILS =
            process.env.ADMIN_EMAILS?.split(";") ?? [];

          const wishlist = Array.isArray(user.wishlist)
            ? user.wishlist
            : [];

          if (ADMIN_EMAILS.includes(user.email)) {
            return {
              data: {
                ...user,
                role: "ADMIN",
                wishlist,
              },
            };
          }

          return {
            data: {
              ...user,
              wishlist,
            },
          };
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

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
  
