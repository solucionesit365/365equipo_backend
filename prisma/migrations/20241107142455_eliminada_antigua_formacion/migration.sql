/*
  Warnings:

  - You are about to drop the `FormacionSanidad` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FormacionSanidad" DROP CONSTRAINT "FormacionSanidad_idTrabajador_fkey";

-- DropTable
DROP TABLE "FormacionSanidad";
