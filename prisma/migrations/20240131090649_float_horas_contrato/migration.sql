/*
  Warnings:

  - You are about to alter the column `horasContrato` on the `contrato` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.

*/
-- AlterTable
ALTER TABLE `contrato` MODIFY `horasContrato` DOUBLE NOT NULL;
