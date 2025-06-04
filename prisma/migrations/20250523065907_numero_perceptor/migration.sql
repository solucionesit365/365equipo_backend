/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,nPerceptor]` on the table `Trabajador` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trabajador" ADD COLUMN     "nPerceptor" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_empresaId_nPerceptor_key" ON "Trabajador"("empresaId", "nPerceptor");
