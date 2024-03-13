-- AlterTable
ALTER TABLE `Contrato` ADD COLUMN `idEmpresa` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_idEmpresa_fkey` FOREIGN KEY (`idEmpresa`) REFERENCES `Empresa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
