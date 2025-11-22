import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body; // 'username' field can be email or username

        // 1. Check for hardcoded admin first (for safety/initial setup)
        if (username === "admin" && password === "admin123") {
            // Check if admin exists in DB, if not create
            let adminUser = await prisma.user.findUnique({ where: { username: "admin" } });
            if (!adminUser) {
                const hashedPassword = await bcrypt.hash("admin123", 10);
                adminUser = await prisma.user.create({
                    data: {
                        username: "admin",
                        email: "admin@example.com",
                        password: hashedPassword,
                        role: "admin",
                    },
                });
            }
            return NextResponse.json({ success: true, user: { username: "admin", role: "admin" } });
        }

        // 2. Check DB for user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username },
                ],
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return NextResponse.json({ success: true, user: { username: user.username, email: user.email, role: user.role } });
        } else {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
