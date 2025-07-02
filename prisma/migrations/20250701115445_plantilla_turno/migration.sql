-- CreateTable
CREATE TABLE "PlantillaTurno" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "inicio" TEXT NOT NULL,
    "final" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PlantillaTurno_pkey" PRIMARY KEY ("id")
);
