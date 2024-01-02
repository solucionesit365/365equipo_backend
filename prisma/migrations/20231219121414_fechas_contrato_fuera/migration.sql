/*
  Warnings:

  - You are about to drop the column `antiguedad` on the `trabajador` table. All the data in the column will be lost.
  - You are about to drop the column `finalContrato` on the `trabajador` table. All the data in the column will be lost.
  - You are about to drop the column `inicioContrato` on the `trabajador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `trabajador` DROP COLUMN `antiguedad`,
    DROP COLUMN `finalContrato`,
    DROP COLUMN `inicioContrato`;
