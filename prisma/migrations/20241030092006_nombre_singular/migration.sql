/*
  Warnings:

  - You are about to drop the `Formaciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasosFormacion" DROP CONSTRAINT "PasosFormacion_formacionesId_fkey";

-- DropTable
DROP TABLE "Formaciones";

-- CreateTable
CREATE TABLE "Formacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,
    "description" TEXT,
    "nPasos" INTEGER NOT NULL,

    CONSTRAINT "Formacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PasosFormacion" ADD CONSTRAINT "PasosFormacion_formacionesId_fkey" FOREIGN KEY ("formacionesId") REFERENCES "Formacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
