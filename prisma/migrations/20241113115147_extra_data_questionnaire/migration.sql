-- AlterTable
ALTER TABLE "Questionnaire" ADD COLUMN     "maxErrors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nQuestions" INTEGER;
