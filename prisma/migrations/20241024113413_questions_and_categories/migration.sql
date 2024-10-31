-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('TEST', 'INPUT');

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAnswer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryAnswerToQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryAnswerToQuestion_AB_unique" ON "_CategoryAnswerToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryAnswerToQuestion_B_index" ON "_CategoryAnswerToQuestion"("B");

-- AddForeignKey
ALTER TABLE "_CategoryAnswerToQuestion" ADD CONSTRAINT "_CategoryAnswerToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "CategoryAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryAnswerToQuestion" ADD CONSTRAINT "_CategoryAnswerToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
