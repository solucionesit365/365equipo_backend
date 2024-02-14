/*
  Warnings:

  - You are about to drop the `Permisos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermisosToRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PermisosToRole` DROP FOREIGN KEY `_PermisosToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PermisosToRole` DROP FOREIGN KEY `_PermisosToRole_B_fkey`;

-- DropTable
DROP TABLE `Permisos`;

-- DropTable
DROP TABLE `_PermisosToRole`;

-- CreateTable
CREATE TABLE `Permiso` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisoToRole` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PermisoToRole_AB_unique`(`A`, `B`),
    INDEX `_PermisoToRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisoToTrabajador` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermisoToTrabajador_AB_unique`(`A`, `B`),
    INDEX `_PermisoToTrabajador_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PermisoToRole` ADD CONSTRAINT `_PermisoToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRole` ADD CONSTRAINT `_PermisoToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToTrabajador` ADD CONSTRAINT `_PermisoToTrabajador_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToTrabajador` ADD CONSTRAINT `_PermisoToTrabajador_B_fkey` FOREIGN KEY (`B`) REFERENCES `Trabajador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
