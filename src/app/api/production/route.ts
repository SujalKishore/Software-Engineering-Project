import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Number(searchParams.get("limit")) || 1000;
        const offset = Number(searchParams.get("offset")) || 0;

        const [records, total] = await Promise.all([
            prisma.productionRecord.findMany({
                take: limit,
                skip: offset,
                orderBy: { date: 'desc' },
            }),
            prisma.productionRecord.count(),
        ]);

        return NextResponse.json({ data: records, total });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch production records" }, { status: 500 });
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
                    entity: "ProductionRecord",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const { line, shift, product, target, actual, efficiency } = body;

        const record = await prisma.productionRecord.create({
            data: {
                line,
                shift,
                product,
                target: Number(target),
                actual: Number(actual),
                efficiency: Number(efficiency),
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create production record" }, { status: 500 });
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
                    entity: "ProductionRecord",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Update request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const { id, line, shift, product, target, actual, efficiency } = body;

        const record = await prisma.productionRecord.update({
            where: { id: Number(id) },
            data: {
                line,
                shift,
                product,
                target: Number(target),
                actual: Number(actual),
                efficiency: Number(efficiency),
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update production record" }, { status: 500 });
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
                    entity: "ProductionRecord",
                    data: JSON.stringify({ id }),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Delete request submitted for approval", pending: true, id: pendingRequest.id });
        }

        await prisma.productionRecord.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete production record" }, { status: 500 });
    }
}
