/*
  Warnings:

  - Added the required column `resourceId` to the `PasosFormacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasosFormacion" ADD COLUMN     "resourceId" TEXT NOT NULL;
