-- CreateTable
CREATE TABLE "FormacionSanidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "idTrabajador" INTEGER NOT NULL,
    "duracion" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "firmadoTrabajador" BOOLEAN NOT NULL DEFAULT false,
    "firmadoEmpresa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FormacionSanidad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormacionSanidad" ADD CONSTRAINT "FormacionSanidad_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
