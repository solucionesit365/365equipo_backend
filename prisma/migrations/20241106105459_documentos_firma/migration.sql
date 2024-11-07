-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" "Department" NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);
