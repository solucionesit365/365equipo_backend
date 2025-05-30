import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  CreatePresentationDto,
  UpdatePresentationDto,
} from "./presentation.dto";
import { IPrismaService } from "../prisma/prisma.interface";

@Injectable()
export class PresentationService {
  constructor(private readonly prismaService: IPrismaService) {}

  async createPresentation(presentation: CreatePresentationDto) {
    try {
      const newPresentation = await this.prismaService.presentacion.create({
        data: {
          ...presentation,
        },
      });

      return newPresentation;
    } catch (error) {
      console.error("Error creating presentation", error);
      throw new InternalServerErrorException("Error creating presentation");
    }
  }

  async getPresentations() {
    return await this.prismaService.presentacion.findMany();
  }

  async getPresentation(id: string) {
    return await this.prismaService.presentacion.findUnique({
      where: { id },
    });
  }

  async deletePresentation(id: string) {
    try {
      return await this.prismaService.presentacion.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting presentation", error);
      throw new InternalServerErrorException("Error deleting presentation");
    }
  }

  async updatePresentation(id: string, presentation: UpdatePresentationDto) {
    try {
      return await this.prismaService.presentacion.update({
        where: { id },
        data: presentation,
      });
    } catch (error) {
      console.error("Error updating presentation", error);
      throw new InternalServerErrorException("Error updating presentation");
    }
  }
}
