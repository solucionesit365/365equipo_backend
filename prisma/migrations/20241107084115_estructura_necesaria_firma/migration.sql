/*
  Warnings:

  - You are about to drop the `Documento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Documento";

-- CreateTable
CREATE TABLE "DocumentoOriginal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,

    CONSTRAINT "DocumentoOriginal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoFirmado" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,

    CONSTRAINT "DocumentoFirmado_pkey" PRIMARY KEY ("id")
);
