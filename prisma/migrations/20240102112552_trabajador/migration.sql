-- AddForeignKey
ALTER TABLE `Trabajador` ADD CONSTRAINT `Trabajador_idResponsable_fkey` FOREIGN KEY (`idResponsable`) REFERENCES `Trabajador`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
