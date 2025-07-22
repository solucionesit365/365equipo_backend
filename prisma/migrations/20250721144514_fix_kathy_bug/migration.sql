-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "existsBC" BOOLEAN NOT NULL DEFAULT false;

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
