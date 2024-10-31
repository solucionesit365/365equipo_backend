/*
  Warnings:

  - You are about to drop the column `category` on the `Presentacion` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `QuestionCategory` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `VideoFormacion` table. All the data in the column will be lost.
  - Added the required column `department` to the `Presentacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `QuestionCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `VideoFormacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PRL', 'Sanidad');

-- AlterTable
ALTER TABLE "Presentacion" DROP COLUMN "category",
ADD COLUMN     "department" "Department" NOT NULL;

-- AlterTable
ALTER TABLE "QuestionCategory" DROP COLUMN "category",
ADD COLUMN     "department" "Department" NOT NULL;

-- AlterTable
ALTER TABLE "VideoFormacion" DROP COLUMN "category",
ADD COLUMN     "department" "Department" NOT NULL;

-- DropEnum
DROP TYPE "BusinessType";

-- DropEnum
DROP TYPE "PresentationCategory";

-- DropEnum
DROP TYPE "VideoCategory";
