import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { QuestionnaireService } from "./questionnaire.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreateQuestionnaireDto,
  DeleteQuestionnaireDto,
  GetQuestionnaireIdDto,
  GetQuestionnairesDto,
  UpdateQuestionnaireDto,
} from "./questionnaire.dto";

@Controller("questionnaire")
export class QuestionnaireController {
  constructor(private readonly questionnaireSerive: QuestionnaireService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createQuestionnaire(@Body() req: CreateQuestionnaireDto) {
    return await this.questionnaireSerive.createQuestionnaire(req);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateQuestionnaire(@Body() req: UpdateQuestionnaireDto) {
    return await this.questionnaireSerive.updateQuestionnaire(req);
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteQuestionnaire(@Body() req: DeleteQuestionnaireDto) {
    return await this.questionnaireSerive.deleteQuestionnaire(req.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getQuestionnaires(@Query() req: GetQuestionnairesDto) {
    return await this.questionnaireSerive.getQuestionnaires(req);
  }

  // @UseGuards(AuthGuard)
  @Get("id")
  async getQuestionnaireById(@Query() req: GetQuestionnaireIdDto) {
    return await this.questionnaireSerive.getQuestionnaireById(req.id);
  }
}
