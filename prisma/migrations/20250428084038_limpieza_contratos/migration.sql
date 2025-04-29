/*
  Warnings:

  - You are about to drop the `Contrato` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contrato2" DROP CONSTRAINT "Contrato2_idEmpresa_fkey";

-- DropTable
DROP TABLE "Contrato";
