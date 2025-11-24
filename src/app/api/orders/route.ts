import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                take: limit,
                skip: offset,
                orderBy: { updatedAt: "desc" },
            }),
            prisma.order.count(),
        ]);

        return NextResponse.json({ data: orders, total });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
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
                    entity: "Order",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Request submitted for approval", pending: true, id: pendingRequest.id });
        }

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
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const body = await request.json();

        // If not admin, create pending request
        if (userRole !== "admin") {
            const pendingRequest = await prisma.pendingRequest.create({
                data: {
                    type: "UPDATE",
                    entity: "Order",
                    data: JSON.stringify(body),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Update request submitted for approval", pending: true, id: pendingRequest.id });
        }

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
                    entity: "Order",
                    data: JSON.stringify({ id }),
                    requestedBy: session?.user?.email || "Unknown",
                },
            });
            return NextResponse.json({ message: "Delete request submitted for approval", pending: true, id: pendingRequest.id });
        }

        await prisma.order.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
