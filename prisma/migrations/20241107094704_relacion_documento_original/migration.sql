/*
  Warnings:

  - Added the required column `documentoOriginalId` to the `DocumentoFirmado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentoFirmado" ADD COLUMN     "documentoOriginalId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentoFirmado" ADD CONSTRAINT "DocumentoFirmado_documentoOriginalId_fkey" FOREIGN KEY ("documentoOriginalId") REFERENCES "DocumentoOriginal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
