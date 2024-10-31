-- CreateEnum
CREATE TYPE "PresentationCategory" AS ENUM ('PRL', 'Sanidad');

-- CreateTable
CREATE TABLE "Presentacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "embed" TEXT NOT NULL,
    "category" "PresentationCategory" NOT NULL,

    CONSTRAINT "Presentacion_pkey" PRIMARY KEY ("id")
);
