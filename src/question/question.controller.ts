import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreateQuestionDto,
  DeleteQuestionDto,
  GetOptionsDto,
  GetQuestionDto,
  GetQuestionsDto,
  UpdateQuestionDto,
} from "./question.dto";

@Controller("question")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createQuestion(@Body() req: CreateQuestionDto) {
    if (req.type === "INPUT")
      return await this.questionService.createQuestionInput(req);
    else {
      const createdQuestion = await this.questionService.createQuestionTest(
        req,
      );
      await this.questionService.addAnswerOptions(createdQuestion.id, req);
      return;
    }
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateQuestion(@Body() req: UpdateQuestionDto) {
    return await this.questionService.updateQuestion(req);
  }

  // @UseGuards(AuthGuard)
  @Get()
  async getQuestions(@Query() req: GetQuestionsDto) {
    return await this.questionService.getQuestions(req.categoryId);
  }

  @UseGuards(AuthGuard)
  @Get("id")
  async getQuestion(@Query() req: GetQuestionDto) {
    return await this.questionService.getQuestion(req.id);
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteQuestion(@Body() req: DeleteQuestionDto) {
    return await this.questionService.deleteQuestion(req.id);
  }

  @Get("options")
  async getQuestionOptions(@Query() req: GetOptionsDto) {
    return await this.questionService.getQuestionOptions(req.id);
  }
}
