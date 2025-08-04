/*
  Warnings:

  - A unique constraint covering the columns `[supervisorId]` on the table `Tienda` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tienda" ADD COLUMN     "supervisorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Tienda_supervisorId_key" ON "Tienda"("supervisorId");

-- AddForeignKey
ALTER TABLE "Tienda" ADD CONSTRAINT "Tienda_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
