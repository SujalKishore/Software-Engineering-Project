-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stockQty" REAL NOT NULL,
    "uom" TEXT NOT NULL,
    "safetyStock" REAL NOT NULL,
    "reorderLevel" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "orderQty" INTEGER NOT NULL,
    "bookedOn" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "dispatchStatus" TEXT NOT NULL DEFAULT 'Not Dispatched',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DispatchRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lrNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "customer" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "transporter" TEXT NOT NULL,
    "truckNo" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "cartons" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_code_key" ON "InventoryItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchRecord_lrNo_key" ON "DispatchRecord"("lrNo");
