/*
  Warnings:

  - You are about to drop the `TiendaCoordinadora` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TiendaCoordinadora" DROP CONSTRAINT "TiendaCoordinadora_tiendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TiendaCoordinadora" DROP CONSTRAINT "TiendaCoordinadora_trabajadorId_fkey";

-- DropIndex
DROP INDEX "public"."Tienda_supervisorId_key";

-- DropTable
DROP TABLE "public"."TiendaCoordinadora";
