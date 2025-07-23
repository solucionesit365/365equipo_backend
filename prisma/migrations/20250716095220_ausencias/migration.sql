-- CreateEnum
CREATE TYPE "TipoAusenciaParcial" AS ENUM ('ABSENTISMO', 'HORAS_JUSTIFICADAS');

-- CreateEnum
CREATE TYPE "TipoAusenciaCompleta" AS ENUM ('BAJA', 'PERMISO_MATERNIDAD_PATERNIDAD', 'DIA_PERSONAL', 'VACACIONES', 'SANCIÓN', 'ABSENTISMO', 'REM');

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

-- AddForeignKey
ALTER TABLE "AusenciaParcial" ADD CONSTRAINT "AusenciaParcial_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusenciaCompleta" ADD CONSTRAINT "AusenciaCompleta_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
