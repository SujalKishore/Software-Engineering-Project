import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const customers = ['Alpha Corp', 'Beta Ltd', 'Gamma Inc', 'Delta Co', 'Epsilon LLC', 'Zeta Ind'];
const regions = ['North', 'South', 'East', 'West', 'Central'];
const products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Tool Z', 'Component C'];
const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold'];
const dispatchStatuses = ['Not Dispatched', 'Dispatched', 'In Transit', 'Delivered'];
const transporters = ['FastTrack', 'Speedy', 'CargoKing', 'LogiTrans'];
const routes = ['R-101', 'R-102', 'R-201', 'R-305', 'H-55'];
const defectTypes = ['Dent', 'Scratch', 'Dimension Error', 'Material Defect', 'Color Mismatch'];
const scrapReasons = ['Machine Error', 'Human Error', 'Material Flaw', 'Process Deviation'];
const inventoryTypes = ['Raw Material', 'WIP', 'Finished Goods', 'Consumable'];
const inventoryCategories = ['Electronics', 'Mechanical', 'Chemical', 'Packaging'];
const locations = ['Warehouse A', 'Warehouse B', 'Shop Floor', 'Store Room'];
const uoms = ['Nos', 'Kg', 'Ltr', 'Mtr'];

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('Start seeding...');

    // --- Inventory ---
    console.log('Seeding Inventory...');
    const inventoryData = [];
    for (let i = 0; i < 500; i++) {
        inventoryData.push({
            code: `INV-${1000 + i}`,
            name: `${randomElement(products)} - ${randomElement(['V1', 'V2', 'Pro', 'Lite'])}`,
            type: randomElement(inventoryTypes),
            category: randomElement(inventoryCategories),
            location: randomElement(locations),
            stockQty: parseFloat((Math.random() * 1000).toFixed(2)),
            uom: randomElement(uoms),
            safetyStock: parseFloat((Math.random() * 100).toFixed(2)),
            reorderLevel: parseFloat((Math.random() * 200).toFixed(2)),
        });
    }

    for (const item of inventoryData) {
        await prisma.inventoryItem.upsert({
            where: { code: item.code },
            update: {},
            create: item
        });
    }

    // --- Orders ---
    console.log('Seeding Orders...');
    const ordersData = [];
    for (let i = 0; i < 2000; i++) {
        ordersData.push({
            orderId: `ORD-${20240000 + i}`,
            customer: randomElement(customers),
            region: randomElement(regions),
            product: randomElement(products),
            orderQty: randomInt(10, 500),
            bookedOn: randomDate(new Date('2024-01-01'), new Date()),
            dueDate: randomDate(new Date(), new Date('2025-12-31')),
            status: randomElement(statuses),
            dispatchStatus: randomElement(dispatchStatuses),
        });
    }

    for (const order of ordersData) {
        await prisma.order.upsert({
            where: { orderId: order.orderId },
            update: {},
            create: order
        });
    }

    // --- Dispatch Records ---
    console.log('Seeding Dispatch Records...');
    const dispatchData = [];
    for (let i = 0; i < 2000; i++) {
        dispatchData.push({
            lrNo: `LR-${randomInt(10000, 99999)}`,
            date: randomDate(new Date('2024-01-01'), new Date()),
            customer: randomElement(customers),
            region: randomElement(regions),
            transporter: randomElement(transporters),
            truckNo: `TN-${randomInt(10, 99)}-${randomElement(['AB', 'XY', 'ZZ'])}-${randomInt(1000, 9999)}`,
            route: randomElement(routes),
            cartons: randomInt(5, 100),
            status: randomElement(['Dispatched', 'Delivered']),
        });
    }

    for (const record of dispatchData) {
        await prisma.dispatchRecord.create({
            data: record
        });
    }


    // --- Scrap Records ---
    console.log('Seeding Scrap Records...');
    const scrapData = [];
    for (let i = 0; i < 2000; i++) {
        scrapData.push({
            date: randomDate(new Date('2024-01-01'), new Date()),
            line: `Line ${randomInt(1, 10)}`,
            defectType: randomElement(defectTypes),
            quantity: randomInt(1, 50),
            reason: randomElement(scrapReasons),
        });
    }

    for (const record of scrapData) {
        await prisma.scrapRecord.create({
            data: record
        });
    }

    // --- Production Records ---
    console.log('Seeding Production Records...');
    const productionData = [];
    const lines = ['Line 1', 'Line 2', 'Line 3', 'Assembly', 'Packaging'];
    const shifts = ['Shift A', 'Shift B', 'Shift C'];

    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        for (const line of lines) {
            for (const shift of shifts) {
                const target = randomInt(800, 1200);
                // Efficiency between 70% and 98%
                const efficiency = randomInt(70, 98);
                const actual = Math.floor(target * (efficiency / 100));

                productionData.push({
                    date: date,
                    line: line,
                    shift: shift,
                    product: randomElement(products),
                    target: target,
                    actual: actual,
                    efficiency: efficiency,
                });
            }
        }
    }

    for (const record of productionData) {
        await prisma.productionRecord.create({
            data: record
        });
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
