/*
  Warnings:

  - A unique constraint covering the columns `[coordinatorId]` on the table `Tienda` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tienda" ADD COLUMN     "coordinatorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Tienda_coordinatorId_key" ON "Tienda"("coordinatorId");

-- AddForeignKey
ALTER TABLE "Tienda" ADD CONSTRAINT "Tienda_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
