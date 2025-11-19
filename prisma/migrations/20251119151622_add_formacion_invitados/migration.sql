-- CreateTable
CREATE TABLE "FormacionInvitado" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "formacionId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "invitadoPorId" INTEGER NOT NULL,
    "trabajadorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormacionInvitado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormacionCompletadaInvitado" (
    "id" TEXT NOT NULL,
    "invitadoId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormacionCompletadaInvitado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormacionInvitado_token_key" ON "FormacionInvitado"("token");

-- CreateIndex
CREATE INDEX "FormacionInvitado_token_idx" ON "FormacionInvitado"("token");

-- CreateIndex
CREATE INDEX "FormacionInvitado_email_idx" ON "FormacionInvitado"("email");

-- AddForeignKey
ALTER TABLE "FormacionInvitado" ADD CONSTRAINT "FormacionInvitado_formacionId_fkey" FOREIGN KEY ("formacionId") REFERENCES "Formacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionInvitado" ADD CONSTRAINT "FormacionInvitado_invitadoPorId_fkey" FOREIGN KEY ("invitadoPorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionInvitado" ADD CONSTRAINT "FormacionInvitado_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionCompletadaInvitado" ADD CONSTRAINT "FormacionCompletadaInvitado_invitadoId_fkey" FOREIGN KEY ("invitadoId") REFERENCES "FormacionInvitado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
