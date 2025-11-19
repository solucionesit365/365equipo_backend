-- AddForeignKey
ALTER TABLE "FormacionCompletada" ADD CONSTRAINT "FormacionCompletada_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionCompletada" ADD CONSTRAINT "FormacionCompletada_formacionId_fkey" FOREIGN KEY ("formacionId") REFERENCES "Formacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
