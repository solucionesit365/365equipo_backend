-- DropForeignKey
ALTER TABLE "AusenciaCompleta" DROP CONSTRAINT "AusenciaCompleta_idTrabajador_fkey";

-- DropForeignKey
ALTER TABLE "AusenciaParcial" DROP CONSTRAINT "AusenciaParcial_idTrabajador_fkey";

-- DropForeignKey
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_idTrabajador_fkey";

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusenciaParcial" ADD CONSTRAINT "AusenciaParcial_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusenciaCompleta" ADD CONSTRAINT "AusenciaCompleta_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
