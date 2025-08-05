-- CreateTable
CREATE TABLE "ParFichaje" (
    "id" TEXT NOT NULL,
    "entrada" TIMESTAMP(3) NOT NULL,
    "salida" TIMESTAMP(3) NOT NULL,
    "idTurno" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "turnoId" TEXT NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "tiendaId" INTEGER NOT NULL,

    CONSTRAINT "ParFichaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParFichaje_idTurno_key" ON "ParFichaje"("idTurno");

-- AddForeignKey
ALTER TABLE "ParFichaje" ADD CONSTRAINT "ParFichaje_idTurno_fkey" FOREIGN KEY ("idTurno") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParFichaje" ADD CONSTRAINT "ParFichaje_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParFichaje" ADD CONSTRAINT "ParFichaje_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
