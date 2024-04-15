-- CreateTable
CREATE TABLE "Trabajador" (
    "id" SERIAL NOT NULL,
    "idApp" TEXT,
    "nombreApellidos" TEXT NOT NULL,
    "displayName" TEXT,
    "emails" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "telefonos" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "nSeguridadSocial" TEXT,
    "codigoPostal" TEXT,
    "cuentaCorriente" TEXT,
    "tipoTrabajador" TEXT NOT NULL,
    "idResponsable" INTEGER,
    "idTienda" INTEGER,
    "llevaEquipo" BOOLEAN NOT NULL,
    "tokenQR" TEXT,
    "displayFoto" TEXT,
    "excedencia" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tienda" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "idExterno" INTEGER,

    CONSTRAINT "Tienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "idExterno" INTEGER,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "idExterno" INTEGER,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "horasContrato" DOUBLE PRECISION NOT NULL,
    "inicioContrato" TIMESTAMP(3) NOT NULL,
    "finalContrato" TIMESTAMP(3),
    "fechaAlta" TIMESTAMP(3) NOT NULL,
    "fechaAntiguedad" TIMESTAMP(3) NOT NULL,
    "fechaBaja" TIMESTAMP(3),
    "dni" TEXT NOT NULL,
    "idEmpresa" TEXT,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToTrabajador" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PermisoToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermisoToTrabajador" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_idApp_key" ON "Trabajador"("idApp");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_dni_key" ON "Trabajador"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToTrabajador_AB_unique" ON "_RoleToTrabajador"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToTrabajador_B_index" ON "_RoleToTrabajador"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermisoToRole_AB_unique" ON "_PermisoToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermisoToRole_B_index" ON "_PermisoToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermisoToTrabajador_AB_unique" ON "_PermisoToTrabajador"("A", "B");

-- CreateIndex
CREATE INDEX "_PermisoToTrabajador_B_index" ON "_PermisoToTrabajador"("B");

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_idTienda_fkey" FOREIGN KEY ("idTienda") REFERENCES "Tienda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_idResponsable_fkey" FOREIGN KEY ("idResponsable") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_dni_fkey" FOREIGN KEY ("dni") REFERENCES "Trabajador"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_B_fkey" FOREIGN KEY ("B") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRole" ADD CONSTRAINT "_PermisoToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRole" ADD CONSTRAINT "_PermisoToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToTrabajador" ADD CONSTRAINT "_PermisoToTrabajador_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToTrabajador" ADD CONSTRAINT "_PermisoToTrabajador_B_fkey" FOREIGN KEY ("B") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
