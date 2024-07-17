-- CreateEnum
CREATE TYPE "TipoAusencia" AS ENUM ('BAJA', 'PERMISO_MATERNIDAD_PATERNIDAD', 'DIA_PERSONAL', 'VACACIONES', 'SANCION', 'ABSENTISMO', 'REM', 'HORAS_JUSTIFICADAS');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "trabajadorId" INTEGER,
    "idTienda" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ausencia" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3) NOT NULL,
    "fechaRevision" TIMESTAMP(3),
    "comentario" TEXT,
    "tipo" "TipoAusencia" NOT NULL,
    "completa" BOOLEAN NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "tiendaId" INTEGER,

    CONSTRAINT "Ausencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_idTienda_fkey" FOREIGN KEY ("idTienda") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ausencia" ADD CONSTRAINT "Ausencia_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ausencia" ADD CONSTRAINT "Ausencia_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
