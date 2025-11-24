import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
    try {
        const requests = await prisma.pendingRequest.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (userRole !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { requestId, action } = body; // action: "APPROVE" or "REJECT"

        const pendingRequest = await prisma.pendingRequest.findUnique({
            where: { id: requestId },
        });

        if (!pendingRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (action === "REJECT") {
            await prisma.pendingRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" },
            });
            return NextResponse.json({ message: "Request rejected" });
        }

        if (action === "APPROVE") {
            const data = JSON.parse(pendingRequest.data);

            if (pendingRequest.entity === "Order") {
                if (pendingRequest.type === "CREATE") {
                    await prisma.order.create({
                        data: {
                            orderId: data.orderId,
                            customer: data.customer,
                            region: data.region,
                            product: data.product,
                            orderQty: Number(data.orderQty),
                            bookedOn: new Date(data.bookedOn),
                            dueDate: new Date(data.dueDate),
                            status: data.status,
                            dispatchStatus: data.dispatchStatus || "Not Dispatched",
                        },
                    });
                } else if (pendingRequest.type === "UPDATE") {
                    await prisma.order.update({
                        where: { id: data.id },
                        data: {
                            orderId: data.orderId,
                            customer: data.customer,
                            region: data.region,
                            product: data.product,
                            orderQty: Number(data.orderQty),
                            bookedOn: new Date(data.bookedOn),
                            dueDate: new Date(data.dueDate),
                            status: data.status,
                            dispatchStatus: data.dispatchStatus,
                        },
                    });
                } else if (pendingRequest.type === "DELETE") {
                    await prisma.order.delete({
                        where: { id: data.id },
                    });
                }
            } else if (pendingRequest.entity === "InventoryItem") {
                if (pendingRequest.type === "CREATE") {
                    await prisma.inventoryItem.create({
                        data: {
                            code: data.code,
                            name: data.name,
                            type: data.type,
                            category: data.category,
                            location: data.location,
                            stockQty: Number(data.stockQty),
                            uom: data.uom,
                            safetyStock: Number(data.safetyStock),
                            reorderLevel: Number(data.reorderLevel),
                        },
                    });
                } else if (pendingRequest.type === "UPDATE") {
                    await prisma.inventoryItem.update({
                        where: { id: data.id },
                        data: {
                            code: data.code,
                            name: data.name,
                            type: data.type,
                            category: data.category,
                            location: data.location,
                            stockQty: Number(data.stockQty),
                            uom: data.uom,
                            safetyStock: Number(data.safetyStock),
                            reorderLevel: Number(data.reorderLevel),
                        },
                    });
                } else if (pendingRequest.type === "DELETE") {
                    await prisma.inventoryItem.delete({
                        where: { id: data.id },
                    });
                }
            } else if (pendingRequest.entity === "DispatchRecord") {
                if (pendingRequest.type === "CREATE") {
                    await prisma.dispatchRecord.create({
                        data: {
                            lrNo: data.lrNo,
                            date: new Date(data.date),
                            customer: data.customer,
                            region: data.region,
                            transporter: data.transporter,
                            truckNo: data.truckNo,
                            route: data.route,
                            cartons: Number(data.cartons),
                            status: data.status,
                        },
                    });
                } else if (pendingRequest.type === "UPDATE") {
                    await prisma.dispatchRecord.update({
                        where: { id: data.id },
                        data: {
                            lrNo: data.lrNo,
                            date: new Date(data.date),
                            customer: data.customer,
                            region: data.region,
                            transporter: data.transporter,
                            truckNo: data.truckNo,
                            route: data.route,
                            cartons: Number(data.cartons),
                            status: data.status,
                        },
                    });
                } else if (pendingRequest.type === "DELETE") {
                    await prisma.dispatchRecord.delete({
                        where: { id: Number(data.id) },
                    });
                }
            } else if (pendingRequest.entity === "ProductionRecord") {
                if (pendingRequest.type === "CREATE") {
                    await prisma.productionRecord.create({
                        data: {
                            line: data.line,
                            shift: data.shift,
                            product: data.product,
                            target: Number(data.target),
                            actual: Number(data.actual),
                            efficiency: Number(data.efficiency),
                        },
                    });
                } else if (pendingRequest.type === "UPDATE") {
                    await prisma.productionRecord.update({
                        where: { id: Number(data.id) },
                        data: {
                            line: data.line,
                            shift: data.shift,
                            product: data.product,
                            target: Number(data.target),
                            actual: Number(data.actual),
                            efficiency: Number(data.efficiency),
                        },
                    });
                } else if (pendingRequest.type === "DELETE") {
                    await prisma.productionRecord.delete({
                        where: { id: Number(data.id) },
                    });
                }
            } else if (pendingRequest.entity === "ScrapRecord") {
                if (pendingRequest.type === "CREATE") {
                    await prisma.scrapRecord.create({
                        data: {
                            line: data.line,
                            defectType: data.defectType,
                            quantity: Number(data.quantity),
                            reason: data.reason,
                        },
                    });
                } else if (pendingRequest.type === "UPDATE") {
                    await prisma.scrapRecord.update({
                        where: { id: Number(data.id) },
                        data: {
                            line: data.line,
                            defectType: data.defectType,
                            quantity: Number(data.quantity),
                            reason: data.reason,
                        },
                    });
                } else if (pendingRequest.type === "DELETE") {
                    await prisma.scrapRecord.delete({
                        where: { id: Number(data.id) },
                    });
                }
            }

            await prisma.pendingRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" },
            });

            return NextResponse.json({ message: "Request approved and executed" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Failed to process request", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
