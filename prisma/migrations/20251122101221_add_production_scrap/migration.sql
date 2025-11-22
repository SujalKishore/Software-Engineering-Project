/*
  Warnings:

  - The primary key for the `DispatchRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cartons` on the `DispatchRecord` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `DispatchRecord` table. All the data in the column will be lost.
  - You are about to drop the column `route` on the `DispatchRecord` table. All the data in the column will be lost.
  - You are about to drop the column `transporter` on the `DispatchRecord` table. All the data in the column will be lost.
  - You are about to drop the column `truckNo` on the `DispatchRecord` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `DispatchRecord` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `destination` to the `DispatchRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleNo` to the `DispatchRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ProductionRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "line" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "actual" INTEGER NOT NULL,
    "efficiency" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "line" TEXT NOT NULL,
    "defectType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DispatchRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lrNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DispatchRecord" ("createdAt", "customer", "date", "id", "lrNo", "status", "updatedAt") SELECT "createdAt", "customer", "date", "id", "lrNo", "status", "updatedAt" FROM "DispatchRecord";
DROP TABLE "DispatchRecord";
ALTER TABLE "new_DispatchRecord" RENAME TO "DispatchRecord";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
