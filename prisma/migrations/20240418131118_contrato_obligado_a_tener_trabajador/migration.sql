/*
  Warnings:

  - Made the column `idTrabajador` on table `Contrato` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_idTrabajador_fkey";

-- AlterTable
ALTER TABLE "Contrato" ALTER COLUMN "idTrabajador" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
