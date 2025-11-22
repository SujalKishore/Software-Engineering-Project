import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const records = await prisma.scrapRecord.findMany({
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch scrap records" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
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
        const body = await request.json();
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.scrapRecord.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete scrap record" }, { status: 500 });
    }
}
