
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    try {
        const orderCount = await prisma.order.count();
        const inventoryCount = await prisma.inventoryItem.count();
        const dispatchCount = await prisma.dispatchRecord.count();
        const scrapCount = await prisma.scrapRecord.count();

        console.log(`Orders: ${orderCount}`);
        console.log(`Inventory Items: ${inventoryCount}`);
        console.log(`Dispatch Records: ${dispatchCount}`);
        console.log(`Scrap Records: ${scrapCount}`);

        const expectedOrders = 2000;
        const expectedInventory = 500;
        const expectedDispatch = 2000;
        const expectedScrap = 2000;

        if (orderCount >= expectedOrders && inventoryCount >= expectedInventory && dispatchCount >= expectedDispatch && scrapCount >= expectedScrap) {
            console.log('SUCCESS: All counts match or exceed expected values.');
        } else {
            console.log('FAILURE: Some counts are lower than expected.');
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
