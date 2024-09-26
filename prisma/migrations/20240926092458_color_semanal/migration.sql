-- CreateEnum
CREATE TYPE "ColorSemanal" AS ENUM ('green', 'orange', 'blue', 'brown');

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "value" "ColorSemanal" NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);
