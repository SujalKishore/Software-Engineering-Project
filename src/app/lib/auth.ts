import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // 1. Check for hardcoded admin
                if (credentials.username === "admin" && credentials.password === "admin123") {
                    return { id: "admin-id", name: "Admin", email: "admin@example.com", role: "admin" } as any;
                }

                // 2. Check DB
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials.username },
                            { email: credentials.username },
                        ],
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (isMatch) {
                    return {
                        id: user.id,
                        name: user.username,
                        email: user.email,
                        role: user.role,
                    };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;

                // Hardcode admin for specific email
                if (user.email === "sujal.kishore23@st.niituniversity.in") {
                    token.role = "admin";
                }
            }

            // Capture Google ID
            if (account && account.provider === "google") {
                token.googleId = account.providerAccountId;
            }

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.googleId = token.googleId;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
