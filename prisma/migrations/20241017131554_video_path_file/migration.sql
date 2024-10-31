/*
  Warnings:

  - Added the required column `pathFile` to the `VideoFormacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoFormacion" ADD COLUMN     "pathFile" TEXT NOT NULL;
