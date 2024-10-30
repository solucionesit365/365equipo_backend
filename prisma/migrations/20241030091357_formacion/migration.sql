-- CreateEnum
CREATE TYPE "PasoFormacionType" AS ENUM ('VIDEO_FORMATIVO', 'PRESENTACION', 'CUESTIONARIO', 'DOCUMENTO_PARA_FIRMAR');

-- CreateTable
CREATE TABLE "Formaciones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,
    "description" TEXT,
    "nPasos" INTEGER NOT NULL,

    CONSTRAINT "Formaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasosFormacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PasoFormacionType" NOT NULL,
    "formacionesId" TEXT,

    CONSTRAINT "PasosFormacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PasosFormacion" ADD CONSTRAINT "PasosFormacion_formacionesId_fkey" FOREIGN KEY ("formacionesId") REFERENCES "Formaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
