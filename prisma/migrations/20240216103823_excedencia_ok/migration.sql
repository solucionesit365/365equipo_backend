/*
  Warnings:

  - You are about to drop the column `excedencias` on the `Trabajador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Trabajador` DROP COLUMN `excedencias`,
    ADD COLUMN `excedencia` BOOLEAN NOT NULL DEFAULT false;
