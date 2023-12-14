-- CreateTable
CREATE TABLE `Trabajador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idApp` VARCHAR(191) NULL,
    `nombreApellidos` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `emails` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `telefonos` VARCHAR(191) NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `nacionalidad` VARCHAR(191) NULL,
    `nSeguridadSocial` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `cuentaCorriente` VARCHAR(191) NULL,
    `tipoTrabajador` VARCHAR(191) NOT NULL,
    `inicioContrato` DATETIME(3) NOT NULL,
    `finalContrato` DATETIME(3) NULL,
    `antiguedad` DATETIME(3) NOT NULL,
    `idResponsable` INTEGER NULL,
    `idTienda` INTEGER NULL,
    `llevaEquipo` BOOLEAN NOT NULL,
    `idEmpresa` INTEGER NOT NULL,
    `tokenQR` VARCHAR(191) NULL,
    `displayFoto` VARCHAR(191) NULL,

    UNIQUE INDEX `Trabajador_idApp_key`(`idApp`),
    UNIQUE INDEX `Trabajador_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tienda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `idExterno` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `idExterno` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cif` VARCHAR(191) NOT NULL,
    `idExterno` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `horasContrato` INTEGER NOT NULL,
    `inicioContrato` DATETIME(3) NOT NULL,
    `finalContrato` DATETIME(3) NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaAntiguedad` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,
    `dni` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trabajador` ADD CONSTRAINT `Trabajador_idTienda_fkey` FOREIGN KEY (`idTienda`) REFERENCES `Tienda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_dni_fkey` FOREIGN KEY (`dni`) REFERENCES `Trabajador`(`dni`) ON DELETE RESTRICT ON UPDATE CASCADE;
