-- AlterTable
ALTER TABLE "_PermisoToRole" ADD CONSTRAINT "_PermisoToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermisoToRole_AB_unique";

-- AlterTable
ALTER TABLE "_PermisoToTrabajador" ADD CONSTRAINT "_PermisoToTrabajador_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermisoToTrabajador_AB_unique";

-- AlterTable
ALTER TABLE "_QuestionToQuestionCategory" ADD CONSTRAINT "_QuestionToQuestionCategory_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_QuestionToQuestionCategory_AB_unique";

-- AlterTable
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoleToTrabajador_AB_unique";

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "final" TIMESTAMP(3) NOT NULL,
    "tiendaId" INTEGER NOT NULL,
    "idTrabajador" INTEGER NOT NULL,
    "borrable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
