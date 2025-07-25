-- CreateEnum
CREATE TYPE "ColorSemanal" AS ENUM ('green', 'orange', 'blue', 'brown');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('TEST', 'INPUT');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PRL', 'Sanidad');

-- CreateEnum
CREATE TYPE "PasoFormacionType" AS ENUM ('VIDEO_FORMATIVO', 'PRESENTACION', 'CUESTIONARIO', 'DOCUMENTO_PARA_FIRMAR');

-- CreateEnum
CREATE TYPE "QuestionnaireType" AS ENUM ('RANDOM', 'SELECTION');

-- CreateTable
CREATE TABLE "Trabajador" (
    "id" SERIAL NOT NULL,
    "idApp" TEXT,
    "nombreApellidos" TEXT NOT NULL,
    "displayName" TEXT,
    "emails" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "telefonos" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "nSeguridadSocial" TEXT,
    "codigoPostal" TEXT,
    "cuentaCorriente" TEXT,
    "tipoTrabajador" TEXT NOT NULL,
    "idResponsable" INTEGER,
    "idTienda" INTEGER,
    "llevaEquipo" BOOLEAN NOT NULL,
    "tokenQR" TEXT,
    "displayFoto" TEXT,
    "excedencia" BOOLEAN NOT NULL DEFAULT false,
    "dispositivo" TEXT,
    "empresaId" TEXT,
    "esTienda" BOOLEAN NOT NULL DEFAULT false,
    "nPerceptor" INTEGER,
    "workEmail" TEXT,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tienda" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "idExterno" INTEGER,

    CONSTRAINT "Tienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "idExterno" INTEGER,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "idExterno" INTEGER,
    "autogestionada" BOOLEAN NOT NULL DEFAULT false,
    "existsBC" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato2" (
    "id" TEXT NOT NULL,
    "horasContrato" DOUBLE PRECISION NOT NULL,
    "inicioContrato" TIMESTAMP(3) NOT NULL,
    "finalContrato" TIMESTAMP(3),
    "fechaAlta" TIMESTAMP(3) NOT NULL,
    "fechaAntiguedad" TIMESTAMP(3) NOT NULL,
    "fechaBaja" TIMESTAMP(3),
    "idTrabajador" INTEGER NOT NULL,

    CONSTRAINT "Contrato2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "value" "ColorSemanal" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFormacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "relativePath" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "pathFile" TEXT NOT NULL,

    CONSTRAINT "VideoFormacion_pkey" PRIMARY KEY ("id")
);

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
    "documentoOriginalId" TEXT NOT NULL,

    CONSTRAINT "DocumentoFirmado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "embed" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,

    CONSTRAINT "Presentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "QuestionnaireType" NOT NULL,
    "maxErrors" INTEGER NOT NULL DEFAULT 0,
    "nQuestions" INTEGER,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,
    "correctAnswerOptionId" TEXT,
    "correctFreeAnswer" TEXT[],
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionnaireId" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "questionnaireId" TEXT,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,
    "description" TEXT,
    "nPasos" INTEGER NOT NULL,

    CONSTRAINT "Formacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasosFormacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PasoFormacionType" NOT NULL,
    "formacionesId" TEXT,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "PasosFormacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SmsOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToTrabajador" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleToTrabajador_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PermisoToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermisoToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PermisoToTrabajador" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermisoToTrabajador_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_QuestionToQuestionCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QuestionToQuestionCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_idApp_key" ON "Trabajador"("idApp");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_dni_key" ON "Trabajador"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_empresaId_nPerceptor_key" ON "Trabajador"("empresaId", "nPerceptor");

-- CreateIndex
CREATE INDEX "_RoleToTrabajador_B_index" ON "_RoleToTrabajador"("B");

-- CreateIndex
CREATE INDEX "_PermisoToRole_B_index" ON "_PermisoToRole"("B");

-- CreateIndex
CREATE INDEX "_PermisoToTrabajador_B_index" ON "_PermisoToTrabajador"("B");

-- CreateIndex
CREATE INDEX "_QuestionToQuestionCategory_B_index" ON "_QuestionToQuestionCategory"("B");

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_idResponsable_fkey" FOREIGN KEY ("idResponsable") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_idTienda_fkey" FOREIGN KEY ("idTienda") REFERENCES "Tienda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato2" ADD CONSTRAINT "Contrato2_idTrabajador_fkey" FOREIGN KEY ("idTrabajador") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoFirmado" ADD CONSTRAINT "DocumentoFirmado_documentoOriginalId_fkey" FOREIGN KEY ("documentoOriginalId") REFERENCES "DocumentoOriginal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCategory" ADD CONSTRAINT "QuestionCategory_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasosFormacion" ADD CONSTRAINT "PasosFormacion_formacionesId_fkey" FOREIGN KEY ("formacionesId") REFERENCES "Formacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTrabajador" ADD CONSTRAINT "_RoleToTrabajador_B_fkey" FOREIGN KEY ("B") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRole" ADD CONSTRAINT "_PermisoToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRole" ADD CONSTRAINT "_PermisoToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToTrabajador" ADD CONSTRAINT "_PermisoToTrabajador_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToTrabajador" ADD CONSTRAINT "_PermisoToTrabajador_B_fkey" FOREIGN KEY ("B") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionCategory" ADD CONSTRAINT "_QuestionToQuestionCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionCategory" ADD CONSTRAINT "_QuestionToQuestionCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "QuestionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

