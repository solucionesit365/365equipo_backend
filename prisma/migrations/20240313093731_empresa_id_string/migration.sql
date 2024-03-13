/*
  Warnings:

  - The primary key for the `Empresa` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Contrato` DROP FOREIGN KEY `Contrato_idEmpresa_fkey`;

-- AlterTable
ALTER TABLE `Contrato` MODIFY `idEmpresa` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Empresa` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_idEmpresa_fkey` FOREIGN KEY (`idEmpresa`) REFERENCES `Empresa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
