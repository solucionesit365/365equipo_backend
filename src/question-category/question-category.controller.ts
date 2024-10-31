import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { QuestionCategoryService } from "./question-category.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreateQuestionCategoryDto,
  GetQuestionCategoryDto,
  UpdateQuestionCategoryDto,
} from "./question-category.dto";

@Controller("question-category")
export class QuestionCategoryController {
  constructor(
    private readonly questionCategoryService: QuestionCategoryService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createQuestionCategory(
    @Body() questionCategory: CreateQuestionCategoryDto,
  ) {
    return await this.questionCategoryService.createQuestionCategory(
      questionCategory,
    );
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateQuestionCategory(
    @Body() questionCategory: UpdateQuestionCategoryDto,
  ) {
    return await this.questionCategoryService.updateQuestionCategory(
      questionCategory,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  async getQuestionCategories(@Query() query: GetQuestionCategoryDto) {
    return await this.questionCategoryService.getQuestionCategories(
      query.department,
    );
  }
}
