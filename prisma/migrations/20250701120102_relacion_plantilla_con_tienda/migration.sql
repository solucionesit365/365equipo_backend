/*
  Warnings:

  - Added the required column `tiendaId` to the `PlantillaTurno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlantillaTurno" ADD COLUMN     "tiendaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PlantillaTurno" ADD CONSTRAINT "PlantillaTurno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
