import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.inventoryItem.findMany({
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
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
        const body = await request.json();
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.inventoryItem.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
