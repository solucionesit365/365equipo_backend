-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_dni_fkey";

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "idTrabajador" INTEGER;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
