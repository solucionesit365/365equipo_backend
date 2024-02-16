/*
  Warnings:

  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermisosToRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolesToTrabajador` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PermisosToRoles` DROP FOREIGN KEY `_PermisosToRoles_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PermisosToRoles` DROP FOREIGN KEY `_PermisosToRoles_B_fkey`;

-- DropForeignKey
ALTER TABLE `_RolesToTrabajador` DROP FOREIGN KEY `_RolesToTrabajador_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RolesToTrabajador` DROP FOREIGN KEY `_RolesToTrabajador_B_fkey`;

-- DropTable
DROP TABLE `Roles`;

-- DropTable
DROP TABLE `_PermisosToRoles`;

-- DropTable
DROP TABLE `_RolesToTrabajador`;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RoleToTrabajador` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RoleToTrabajador_AB_unique`(`A`, `B`),
    INDEX `_RoleToTrabajador_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisosToRole` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PermisosToRole_AB_unique`(`A`, `B`),
    INDEX `_PermisosToRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_RoleToTrabajador` ADD CONSTRAINT `_RoleToTrabajador_A_fkey` FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RoleToTrabajador` ADD CONSTRAINT `_RoleToTrabajador_B_fkey` FOREIGN KEY (`B`) REFERENCES `Trabajador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisosToRole` ADD CONSTRAINT `_PermisosToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permisos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisosToRole` ADD CONSTRAINT `_PermisosToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
