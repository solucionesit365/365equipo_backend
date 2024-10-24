import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateQuestionCategoryDto,
  UpdateQuestionCategoryDto,
} from "./question-category.dto";

@Injectable()
export class QuestionCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async createQuestionCategory(questionCategory: CreateQuestionCategoryDto) {
    try {
      const newQuestionCategory =
        await this.prismaService.questionCategory.create({
          data: {
            ...questionCategory,
          },
        });

      return newQuestionCategory;
    } catch (error) {
      console.error("Error creating question category", error);
      throw new InternalServerErrorException(
        "Error creating question category",
      );
    }
  }

  async updateQuestionCategory(questionCategory: UpdateQuestionCategoryDto) {
    try {
      const updatedQuestionCategory =
        await this.prismaService.questionCategory.update({
          where: {
            id: questionCategory.id,
          },
          data: {
            category: questionCategory.category,
            name: questionCategory.name,
          },
        });

      return updatedQuestionCategory;
    } catch (error) {
      console.error("Error updating question category", error);
      throw new InternalServerErrorException(
        "Error updating question category",
      );
    }
  }

  async getQuestionCategories(filterCategory: "PRL" | "Sanidad") {
    try {
      return await this.prismaService.questionCategory.findMany({
        where: {
          category: filterCategory,
        },
      });
    } catch (error) {
      console.error("Error getting question categories", error);
      throw new InternalServerErrorException(
        "Error getting question categories",
      );
    }
  }
}
