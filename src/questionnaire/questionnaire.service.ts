import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateQuestionnaireDto,
  GetQuestionnairesDto,
  UpdateQuestionnaireDto,
} from "./questionnaire.dto";

@Injectable()
export class QuestionnaireService {
  constructor(private readonly prismaService: PrismaService) {}

  async createQuestionnaire(req: CreateQuestionnaireDto) {
    try {
      const questionnaire = await this.prismaService.questionnaire.create({
        data: {
          name: req.name,
          department: req.department,
          type: req.type,
          questions: {
            connect: req.questions.map((question) => ({ id: question })),
          },
          categoryOfQuestions: {
            connect: req.categoryOfQuestions.map((category) => ({
              id: category,
            })),
          },
        },
      });
      return questionnaire;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error creating questionnaire");
    }
  }

  async updateQuestionnaire(req: UpdateQuestionnaireDto) {
    try {
      const questionnaire = await this.prismaService.questionnaire.update({
        where: { id: req.id },
        data: {
          name: req.name,
          department: req.department,
          type: req.type,
          questions: {
            set: req.questions.map((question) => ({ id: question })),
          },
          categoryOfQuestions: {
            set: req.categoryOfQuestions.map((category) => ({
              id: category,
            })),
          },
        },
      });
      return questionnaire;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error updating questionnaire");
    }
  }

  async deleteQuestionnaire(id: string) {
    try {
      await this.prismaService.questionnaire.delete({ where: { id } });
      return { message: "Questionnaire deleted" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error deleting questionnaire");
    }
  }

  async getQuestionnaires(req: GetQuestionnairesDto) {
    try {
      const questionnaires = await this.prismaService.questionnaire.findMany({
        include: {
          questions: true,
          categoryOfQuestions: true,
        },
      });
      return questionnaires;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error getting questionnaires");
    }
  }

  async getQuestionnaireById(id: string) {
    try {
      const questionnaire = await this.prismaService.questionnaire.findUnique({
        where: { id },
        include: {
          questions: true,
          categoryOfQuestions: true,
        },
      });
      return questionnaire;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error getting questionnaire");
    }
  }
}
