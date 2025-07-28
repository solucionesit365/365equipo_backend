-- AddForeignKey
ALTER TABLE "Contrato2" ADD CONSTRAINT "Contrato2_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_B_fkey" FOREIGN KEY ("B") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
