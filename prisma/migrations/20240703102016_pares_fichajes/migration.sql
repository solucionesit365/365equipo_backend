-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('TRABAJANDO', 'COMIENDO', 'DESCANSANDO');

-- CreateTable
CREATE TABLE "ParesFichaje" (
    "id" SERIAL NOT NULL,
    "entrada" TIMESTAMP(3) NOT NULL,
    "descansos" JSONB NOT NULL,
    "estado" "Estado" NOT NULL,
    "salida" TIMESTAMP(3) NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "lugarId" INTEGER,

    CONSTRAINT "ParesFichaje_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParesFichaje" ADD CONSTRAINT "ParesFichaje_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParesFichaje" ADD CONSTRAINT "ParesFichaje_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Tienda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
