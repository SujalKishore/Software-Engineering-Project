import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const records = await prisma.dispatchRecord.findMany({
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch dispatch records" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const record = await prisma.dispatchRecord.create({
            data: {
                lrNo: body.lrNo,
                date: new Date(body.date),
                customer: body.customer,
                region: body.region,
                transporter: body.transporter,
                truckNo: body.truckNo,
                route: body.route,
                cartons: Number(body.cartons),
                status: body.status,
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create dispatch record" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const record = await prisma.dispatchRecord.update({
            where: { id: body.id },
            data: {
                lrNo: body.lrNo,
                date: new Date(body.date),
                customer: body.customer,
                region: body.region,
                transporter: body.transporter,
                truckNo: body.truckNo,
                route: body.route,
                cartons: Number(body.cartons),
                status: body.status,
            },
        });
        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update dispatch record" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.dispatchRecord.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete dispatch record" }, { status: 500 });
    }
}
