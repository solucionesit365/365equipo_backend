/*
  Warnings:

  - Added the required column `category` to the `CategoryAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('PRL', 'Sanidad');

-- AlterTable
ALTER TABLE "CategoryAnswer" ADD COLUMN     "category" "QuestionCategory" NOT NULL;
