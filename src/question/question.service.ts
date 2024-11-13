import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateQuestionDto,
  DeleteQuestionDto,
  GetQuestionsDto,
  UpdateQuestionDto,
} from "./question.dto";

@Injectable()
export class QuestionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createQuestionTest(question: CreateQuestionDto) {
    try {
      const newQuestion = await this.prismaService.question.create({
        data: {
          title: question.title,
          type: question.type,
          categories: {
            connect: question.categories.map((categoryId: string) => ({
              id: categoryId,
            })),
          },
          // options: {
          //   create: question.options.map((option) => ({
          //     title: option.text,
          //   })),
          // },
        },
      });

      return newQuestion;
    } catch (error) {
      console.error("Error creating question", error);
      throw new InternalServerErrorException("Error creating question");
    }
  }

  async createQuestionInput(question: CreateQuestionDto) {
    try {
      const newQuestion = await this.prismaService.question.create({
        data: {
          correctFreeAnswer: question.correctFreeAnswer,
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

  async addAnswerOptions(questionId: string, questionReq: CreateQuestionDto) {
    try {
      const createData: { questionId: string; title: string }[] = [];
      let correctOption: { questionId: string; title: string } = null;

      for (let i = 0; i < questionReq.options.length; i += 1) {
        if (i === questionReq.correctAnswerOptionIndex) {
          correctOption = { title: questionReq.options[i].text, questionId };
        } else {
          createData.push({
            questionId,
            title: questionReq.options[i].text,
          });
        }
      }

      if (!correctOption)
        throw new InternalServerErrorException(
          "No hay ninguna opción correcta",
        );

      await this.prismaService.answerOption.createMany({
        data: createData,
      });

      const createdCorrectOption = await this.prismaService.answerOption.create(
        {
          data: correctOption,
        },
      );

      await this.prismaService.question.update({
        where: {
          id: questionId,
        },
        data: {
          correctAnswerOptionId: createdCorrectOption.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        "No se ha podido agregar las answer options",
      );
    }
  }

  async updateQuestion(question: UpdateQuestionDto) {
    try {
      const updatedQuestion = await this.prismaService.question.update({
        where: {
          id: question.id,
        },
        data: {
          correctAnswerOptionId: question.correctAnswerOptionId,
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

  async getQuestions(categoryId: GetQuestionsDto["categoryId"]) {
    try {
      return await this.prismaService.question.findMany({
        where: {
          categories: {
            some: {
              id: categoryId,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error getting questions", error);
      throw new InternalServerErrorException("Error getting questions");
    }
  }

  async getQuestion(id: string) {
    try {
      return await this.prismaService.question.findUnique({
        where: {
          id,
        },
        include: {
          categories: true,
          options: true,
        },
      });
    } catch (error) {
      console.error("Error getting question", error);
      throw new InternalServerErrorException("Error getting question");
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

  async getQuestionOptions(id: string) {
    try {
      return await this.prismaService.answerOption.findMany({
        where: {
          questionId: id,
        },
      });
    } catch (error) {
      console.error("Error getting question options", error);
      throw new InternalServerErrorException("Error getting question options");
    }
  }
}
