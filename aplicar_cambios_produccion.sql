-- Script para aplicar los cambios faltantes en producción
-- IMPORTANTE: Este script agrega las estructuras faltantes sin eliminar datos existentes

-- 1. Crear los enums
CREATE TYPE "TipoAusenciaParcial" AS ENUM ('ABSENTISMO', 'HORAS_JUSTIFICADAS');
CREATE TYPE "TipoAusenciaCompleta" AS ENUM ('BAJA', 'PERMISO_MATERNIDAD_PATERNIDAD', 'DIA_PERSONAL', 'VACACIONES', 'ABSENTISMO', 'REM');

-- 2. Agregar columna coordinatorId a la tabla Tienda
ALTER TABLE "Tienda" ADD COLUMN "coordinatorId" INTEGER;

-- 3. Crear tabla Turno
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3) NOT NULL,
    "tiendaId" INTEGER NOT NULL,
    "idTrabajador" INTEGER NOT NULL,
    "borrable" BOOLEAN NOT NULL DEFAULT false,
    "bolsaHorasInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- 4. Crear tabla PlantillaTurno
CREATE TABLE "PlantillaTurno" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "inicio" TEXT NOT NULL,
    "final" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "tiendaId" INTEGER NOT NULL,

    CONSTRAINT "PlantillaTurno_pkey" PRIMARY KEY ("id")
);

-- 5. Crear tabla AusenciaParcial
CREATE TABLE "AusenciaParcial" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAusenciaParcial" NOT NULL,
    "comentario" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinal" TIMESTAMP(3) NOT NULL,
    "idTrabajador" INTEGER NOT NULL,

    CONSTRAINT "AusenciaParcial_pkey" PRIMARY KEY ("id")
);

-- 6. Crear tabla AusenciaCompleta
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

-- 7. Crear índice único para coordinatorId
CREATE UNIQUE INDEX "Tienda_coordinatorId_key" ON "Tienda"("coordinatorId");

-- 8. Agregar las foreign keys
ALTER TABLE "Tienda" ADD CONSTRAINT "Tienda_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlantillaTurno" ADD CONSTRAINT "PlantillaTurno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AusenciaParcial" ADD CONSTRAINT "AusenciaParcial_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AusenciaCompleta" ADD CONSTRAINT "AusenciaCompleta_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;