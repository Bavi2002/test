import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Profile, User, Account } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";
import { put } from "@vercel/blob";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          company: user.company,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
    updateAge: 6 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            image: true,
          },
        });

        if (user) {
          session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            company: user.company,
            image: user.image || token.picture,
          };
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.company = user.company;
        token.image = user.image;
      }
      return token;
    },
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      if (account?.provider !== "credentials") {
        const email = user.email;
        if (!email) {
          return false;
        }

        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        let profileImageUrl: string | null = null;

        if (!dbUser && profile?.image) {
          try {
            const response = await fetch(profile.image);
            const imageBlob = await response.blob();
            const fileExtension = profile.image.split(".").pop() || "jpg";
            const fileName = `profiles/${email}-${Date.now()}.${fileExtension}`;
            const blob = await put(fileName, imageBlob, {
              access: "public",
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            profileImageUrl = blob.url;
          } catch (error) {
            console.error("Failed to upload social profile image:", error);
          }
        }

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              userId: crypto.randomUUID(),
              email,
              name: user.name || email.split("@")[0],
              company: "",
              password: "",
              image: profileImageUrl ?? "",
            },
          });
        } else if (profileImageUrl && !dbUser.image) {
          await prisma.user.update({
            where: { email },
            data: { image: profileImageUrl },
          });
        }

        user.id = dbUser.id;
        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);