import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({
                take: limit,
                skip: offset,
                orderBy: { updatedAt: "desc" },
            }),
            prisma.inventoryItem.count(),
        ]);

        return NextResponse.json({ data: items, total });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
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
                    entity: "InventoryItem",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const item = await prisma.inventoryItem.create({
            data: {
                code: body.code,
                name: body.name,
                type: body.type,
                category: body.category,
                location: body.location,
                stockQty: Number(body.stockQty),
                uom: body.uom,
                safetyStock: Number(body.safetyStock),
                reorderLevel: Number(body.reorderLevel),
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
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
                    entity: "InventoryItem",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Update request submitted for approval", pending: true, id: pendingRequest.id });
        }

        const item = await prisma.inventoryItem.update({
            where: { id: body.id },
            data: {
                code: body.code,
                name: body.name,
                type: body.type,
                category: body.category,
                location: body.location,
                stockQty: Number(body.stockQty),
                uom: body.uom,
                safetyStock: Number(body.safetyStock),
                reorderLevel: Number(body.reorderLevel),
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
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
                    entity: "InventoryItem",
                    data: JSON.stringify({ id }),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Delete request submitted for approval", pending: true, id: pendingRequest.id });
        }

        await prisma.inventoryItem.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
