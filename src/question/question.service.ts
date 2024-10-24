import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateQuestionDto,
  DeleteQuestionDto,
  UpdateQuestionDto,
} from "./question.dto";

@Injectable()
export class QuestionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createQuestion(question: CreateQuestionDto) {
    try {
      const newQuestion = await this.prismaService.question.create({
        data: {
          answer: question.answer,
          title: question.title,
          type: question.type,
          categories: {
            connect: question.categories.map((categoryId: string) => ({
              id: categoryId,
            })),
          },
        },
      });

      return newQuestion;
    } catch (error) {
      console.error("Error creating question", error);
      throw new InternalServerErrorException("Error creating question");
    }
  }

  async updateQuestion(question: UpdateQuestionDto) {
    try {
      const updatedQuestion = await this.prismaService.question.update({
        where: {
          id: question.id,
        },
        data: {
          answer: question.answer,
          title: question.title,
          type: question.type,
          categories: {
            set: question.category.map((categoryId: string) => ({
              id: categoryId,
            })),
          },
        },
      });

      return updatedQuestion;
    } catch (error) {
      console.error("Error updating question", error);
      throw new InternalServerErrorException("Error updating question");
    }
  }

  async getQuestions() {
    try {
      return await this.prismaService.question.findMany();
    } catch (error) {
      console.error("Error getting questions", error);
      throw new InternalServerErrorException("Error getting questions");
    }
  }

  async deleteQuestion(id: DeleteQuestionDto["id"]) {
    try {
      return await this.prismaService.question.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error("Error deleting question", error);
      throw new InternalServerErrorException("Error deleting question");
    }
  }
}
