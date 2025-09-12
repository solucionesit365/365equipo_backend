import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { INotificationDeviceRepository } from "./INotificationDevice.repository";
import { Prisma, NotificationDevice } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationDeviceRepository
  implements INotificationDeviceRepository
{
  constructor(private readonly prismaService: PrismaService) {}

  async createOne(
    data: Prisma.NotificationDeviceCreateInput & {
      trabajador: { connect: { uid: string } };
    },
  ): Promise<NotificationDevice> {
    try {
      return await this.prismaService.notificationDevice.create({
        data,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async upsertOne(
    token: string,
    data: Prisma.NotificationDeviceCreateInput,
  ): Promise<NotificationDevice> {
    try {
      return await this.prismaService.notificationDevice.upsert({
        where: { token },
        create: data,
        update: {
          // Solo actualizamos lastTime (se actualiza automáticamente por @updatedAt)
          // y potencialmente el trabajador si cambió
          trabajador: data.trabajador,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteOneById(id: string): Promise<void> {
    try {
      await this.prismaService.notificationDevice.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteOneByToken(token: string): Promise<void> {
    try {
      await this.prismaService.notificationDevice.delete({
        where: {
          token,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getManyByTrabajador(uid: string): Promise<NotificationDevice[]> {
    try {
      return await this.prismaService.notificationDevice.findMany({
        where: {
          trabajador: {
            idApp: uid,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getOneById(id: string): Promise<NotificationDevice> {
    try {
      return await this.prismaService.notificationDevice.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getOneByToken(token: string): Promise<NotificationDevice> {
    try {
      return await this.prismaService.notificationDevice.findUnique({
        where: {
          token,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
