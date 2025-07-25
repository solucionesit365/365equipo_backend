/*
  Warnings:

  - A unique constraint covering the columns `[coordinatorId]` on the table `Tienda` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoAusenciaParcial" AS ENUM ('ABSENTISMO', 'HORAS_JUSTIFICADAS');

-- CreateEnum
CREATE TYPE "TipoAusenciaCompleta" AS ENUM ('BAJA', 'PERMISO_MATERNIDAD_PATERNIDAD', 'DIA_PERSONAL', 'VACACIONES', 'ABSENTISMO', 'REM');

-- DropForeignKey
ALTER TABLE "Contrato2" DROP CONSTRAINT "Contrato2_idTrabajador_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToTrabajador" DROP CONSTRAINT "_RoleToTrabajador_B_fkey";

-- AlterTable
ALTER TABLE "Tienda" ADD COLUMN     "coordinatorId" INTEGER;

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3) NOT NULL,
    "tiendaId" INTEGER NOT NULL,
    "idTrabajador" INTEGER NOT NULL,
    "borrable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaTurno" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "inicio" TEXT NOT NULL,
    "final" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "tiendaId" INTEGER NOT NULL,

    CONSTRAINT "PlantillaTurno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AusenciaParcial" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAusenciaParcial" NOT NULL,
    "comentario" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinal" TIMESTAMP(3) NOT NULL,
    "idTrabajador" INTEGER NOT NULL,

    CONSTRAINT "AusenciaParcial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AusenciaCompleta" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAusenciaCompleta" NOT NULL,
    "comentario" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinal" TIMESTAMP(3),
    "fechaRevision" TIMESTAMP(3),
    "idTrabajador" INTEGER NOT NULL,

    CONSTRAINT "AusenciaCompleta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tienda_coordinatorId_key" ON "Tienda"("coordinatorId");

-- AddForeignKey
ALTER TABLE "Tienda" ADD CONSTRAINT "Tienda_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaTurno" ADD CONSTRAINT "PlantillaTurno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusenciaParcial" ADD CONSTRAINT "AusenciaParcial_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusenciaCompleta" ADD CONSTRAINT "AusenciaCompleta_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
