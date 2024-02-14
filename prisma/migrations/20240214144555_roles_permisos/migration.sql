-- CreateTable
CREATE TABLE `Roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permisos` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RolesToTrabajador` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RolesToTrabajador_AB_unique`(`A`, `B`),
    INDEX `_RolesToTrabajador_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisosToRoles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PermisosToRoles_AB_unique`(`A`, `B`),
    INDEX `_PermisosToRoles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_RolesToTrabajador` ADD CONSTRAINT `_RolesToTrabajador_A_fkey` FOREIGN KEY (`A`) REFERENCES `Roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolesToTrabajador` ADD CONSTRAINT `_RolesToTrabajador_B_fkey` FOREIGN KEY (`B`) REFERENCES `Trabajador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisosToRoles` ADD CONSTRAINT `_PermisosToRoles_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permisos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisosToRoles` ADD CONSTRAINT `_PermisosToRoles_B_fkey` FOREIGN KEY (`B`) REFERENCES `Roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
