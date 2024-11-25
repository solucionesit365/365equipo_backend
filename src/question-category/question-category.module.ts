import { Module } from "@nestjs/common";
import { QuestionCategoryController } from "./question-category.controller";
import { QuestionCategoryService } from "./question-category.service";

@Module({
  controllers: [QuestionCategoryController],
  providers: [QuestionCategoryService],
})
export class QuestionCategoryModule {}
