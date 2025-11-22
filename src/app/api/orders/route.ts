import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const order = await prisma.order.create({
            data: {
                orderId: body.orderId,
                customer: body.customer,
                region: body.region,
                product: body.product,
                orderQty: Number(body.orderQty),
                bookedOn: new Date(body.bookedOn),
                dueDate: new Date(body.dueDate),
                status: body.status,
                dispatchStatus: body.dispatchStatus || "Not Dispatched",
            },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const order = await prisma.order.update({
            where: { id: body.id },
            data: {
                orderId: body.orderId,
                customer: body.customer,
                region: body.region,
                product: body.product,
                orderQty: Number(body.orderQty),
                bookedOn: new Date(body.bookedOn),
                dueDate: new Date(body.dueDate),
                status: body.status,
                dispatchStatus: body.dispatchStatus,
            },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.order.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
