import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuestionService } from "./question.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreateQuestionDto,
  DeleteQuestionDto,
  UpdateQuestionDto,
} from "./question.dto";

@Controller("question")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createQuestion(@Body() req: CreateQuestionDto) {
    return await this.questionService.createQuestion(req);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateQuestion(@Body() req: UpdateQuestionDto) {
    return await this.questionService.updateQuestion(req);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getQuestions() {
    return await this.questionService.getQuestions();
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteQuestion(@Body() req: DeleteQuestionDto) {
    return await this.questionService.deleteQuestion(req.id);
  }
}
