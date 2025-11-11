/*
  Warnings:

  - A unique constraint covering the columns `[supervisorId]` on the table `Tienda` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "TiendaCoordinadora" (
    "id" SERIAL NOT NULL,
    "tiendaId" INTEGER NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TiendaCoordinadora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiendaCoordinadora_tiendaId_trabajadorId_key" ON "TiendaCoordinadora"("tiendaId", "trabajadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Tienda_supervisorId_key" ON "Tienda"("supervisorId");

-- AddForeignKey
ALTER TABLE "TiendaCoordinadora" ADD CONSTRAINT "TiendaCoordinadora_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TiendaCoordinadora" ADD CONSTRAINT "TiendaCoordinadora_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
