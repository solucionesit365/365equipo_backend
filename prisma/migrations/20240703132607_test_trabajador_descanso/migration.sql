/*
  Warnings:

  - Added the required column `trabajadorId` to the `Descanso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Descanso" ADD COLUMN     "trabajadorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Descanso" ADD CONSTRAINT "Descanso_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
