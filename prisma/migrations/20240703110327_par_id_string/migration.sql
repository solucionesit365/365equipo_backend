/*
  Warnings:

  - The primary key for the `ParesFichaje` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ParesFichaje" DROP CONSTRAINT "ParesFichaje_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ParesFichaje_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ParesFichaje_id_seq";
