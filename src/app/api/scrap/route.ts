import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const [records, total] = await Promise.all([
            prisma.scrapRecord.findMany({
                take: limit,
                skip: offset,
                orderBy: { date: 'desc' },
            }),
            prisma.scrapRecord.count(),
        ]);

        return NextResponse.json({ data: records, total });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch scrap records" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const body = await request.json();

        // If not admin, create pending request
        if (userRole !== "admin") {
            const pendingRequest = await prisma.pendingRequest.create({
                data: {
                    type: "CREATE",
                    entity: "ScrapRecord",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const { line, defectType, quantity, reason } = body;

        const record = await prisma.scrapRecord.create({
            data: {
                line,
                defectType,
                quantity: Number(quantity),
                reason,
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create scrap record" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const body = await request.json();

        // If not admin, create pending request
        if (userRole !== "admin") {
            const pendingRequest = await prisma.pendingRequest.create({
                data: {
                    type: "UPDATE",
                    entity: "ScrapRecord",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Update request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const { id, line, defectType, quantity, reason } = body;

        const record = await prisma.scrapRecord.update({
            where: { id: Number(id) },
            data: {
                line,
                defectType,
                quantity: Number(quantity),
                reason,
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update scrap record" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // If not admin, create pending request
        if (userRole !== "admin") {
            const pendingRequest = await prisma.pendingRequest.create({
                data: {
                    type: "DELETE",
                    entity: "ScrapRecord",
                    data: JSON.stringify({ id }),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Delete request submitted for approval", pending: true, id: pendingRequest.id });
        }

        await prisma.scrapRecord.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete scrap record" }, { status: 500 });
    }
}
