import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const records = await prisma.productionRecord.findMany({
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch production records" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
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
        const body = await request.json();
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.productionRecord.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete production record" }, { status: 500 });
    }
}
