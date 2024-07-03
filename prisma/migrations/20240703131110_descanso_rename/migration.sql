/*
  Warnings:

  - You are about to drop the column `idFichaje` on the `Descanso` table. All the data in the column will be lost.
  - Added the required column `idPar` to the `Descanso` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Descanso" DROP CONSTRAINT "Descanso_idFichaje_fkey";

-- AlterTable
ALTER TABLE "Descanso" DROP COLUMN "idFichaje",
ADD COLUMN     "idPar" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Descanso" ADD CONSTRAINT "Descanso_idPar_fkey" FOREIGN KEY ("idPar") REFERENCES "ParesFichaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
