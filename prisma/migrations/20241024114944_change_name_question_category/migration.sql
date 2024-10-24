/*
  Warnings:

  - You are about to drop the `CategoryAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryAnswerToQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('PRL', 'Sanidad');

-- DropForeignKey
ALTER TABLE "_CategoryAnswerToQuestion" DROP CONSTRAINT "_CategoryAnswerToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryAnswerToQuestion" DROP CONSTRAINT "_CategoryAnswerToQuestion_B_fkey";

-- DropTable
DROP TABLE "CategoryAnswer";

-- DropTable
DROP TABLE "_CategoryAnswerToQuestion";

-- DropEnum
DROP TYPE "QuestionCategory";

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BusinessType" NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionToQuestionCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToQuestionCategory_AB_unique" ON "_QuestionToQuestionCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToQuestionCategory_B_index" ON "_QuestionToQuestionCategory"("B");

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionCategory" ADD CONSTRAINT "_QuestionToQuestionCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionCategory" ADD CONSTRAINT "_QuestionToQuestionCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "QuestionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
