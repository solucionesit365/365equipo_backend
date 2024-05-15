-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_idEmpresa_fkey";

-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_idTrabajador_fkey";

-- CreateTable
CREATE TABLE "Contrato2" (
    "id" TEXT NOT NULL,
    "horasContrato" DOUBLE PRECISION NOT NULL,
    "inicioContrato" TIMESTAMP(3) NOT NULL,
    "finalContrato" TIMESTAMP(3),
    "fechaAlta" TIMESTAMP(3) NOT NULL,
    "fechaAntiguedad" TIMESTAMP(3) NOT NULL,
    "fechaBaja" TIMESTAMP(3),
    "dni" TEXT NOT NULL,
    "idEmpresa" TEXT,
    "idTrabajador" INTEGER NOT NULL,

    CONSTRAINT "Contrato2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contrato2" ADD CONSTRAINT "Contrato2_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato2" ADD CONSTRAINT "Contrato2_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
