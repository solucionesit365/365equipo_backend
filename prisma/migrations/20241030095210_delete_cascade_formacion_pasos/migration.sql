-- DropForeignKey
ALTER TABLE "PasosFormacion" DROP CONSTRAINT "PasosFormacion_formacionesId_fkey";

-- AddForeignKey
ALTER TABLE "PasosFormacion" ADD CONSTRAINT "PasosFormacion_formacionesId_fkey" FOREIGN KEY ("formacionesId") REFERENCES "Formacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
