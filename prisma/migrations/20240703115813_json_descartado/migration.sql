/*
  Warnings:

  - You are about to drop the column `descansos` on the `ParesFichaje` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoDescanso" AS ENUM ('DESCANSO', 'COMIDA');

-- AlterTable
ALTER TABLE "ParesFichaje" DROP COLUMN "descansos";

-- CreateTable
CREATE TABLE "Descanso" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3),
    "tipo" "TipoDescanso" NOT NULL,
    "idFichaje" TEXT NOT NULL,

    CONSTRAINT "Descanso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Descanso" ADD CONSTRAINT "Descanso_idFichaje_fkey" FOREIGN KEY ("idFichaje") REFERENCES "ParesFichaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
