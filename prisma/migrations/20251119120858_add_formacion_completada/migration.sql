-- CreateTable
CREATE TABLE "FormacionCompletada" (
    "id" TEXT NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "formacionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormacionCompletada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormacionCompletada_trabajadorId_formacionId_key" ON "FormacionCompletada"("trabajadorId", "formacionId");
