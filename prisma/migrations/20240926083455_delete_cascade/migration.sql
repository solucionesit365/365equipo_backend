-- DropForeignKey
ALTER TABLE "Contrato2" DROP CONSTRAINT "Contrato2_idTrabajador_fkey";

-- AddForeignKey
ALTER TABLE "Contrato2" ADD CONSTRAINT "Contrato2_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
