import { PrismaClient } from "@prisma/client";

export abstract class IPrismaService extends PrismaClient {
  abstract onModuleInit(): Promise<void>;
  abstract onModuleDestroy(): Promise<void>;
}
