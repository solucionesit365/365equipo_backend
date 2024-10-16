-- AlterTable
ALTER TABLE "Trabajador" ADD COLUMN     "empresaId" TEXT;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
