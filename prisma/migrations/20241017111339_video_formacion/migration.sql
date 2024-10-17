-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('PRL', 'Sanidad');

-- CreateTable
CREATE TABLE "VideoFormacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "category" "VideoCategory" NOT NULL,

    CONSTRAINT "VideoFormacion_pkey" PRIMARY KEY ("id")
);
