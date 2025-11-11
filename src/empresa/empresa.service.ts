import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  CreateEmpresaDto,
  DeleteEmpresaDto,
  UpdateEmpresaDto,
} from "./empresa.dto";
import { PrismaService } from "../prisma/prisma.service";
import { MongoService } from "../mongo/mongo.service";
import { CompanyCreate } from "./company.interface";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mongoService: MongoService,
  ) {}

  async createCompany(reqCreateEmpresa: CreateEmpresaDto) {
    try {
      const companyCollection =
        await this.mongoService.getCollection<CompanyCreate>("company");
      return await companyCollection.insertOne(reqCreateEmpresa);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateEmpresa(reqUpdateEmpresa: UpdateEmpresaDto) {
    try {
      const companyCollection =
        await this.mongoService.getCollection<CompanyCreate>("company");

      const empresa = await companyCollection.updateOne(
        {
          id: reqUpdateEmpresa.id,
        },
        {
          $set: {
            ...reqUpdateEmpresa,
          },
        },
      );
      return empresa;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getEmpresas(onlyExistsBC?: boolean) {
    const where = onlyExistsBC ? { existsBC: true } : {};
    return await this.prismaService.empresa.findMany({ where });
  }

  async deleteEmpresa(reqDeleteEmpresa: DeleteEmpresaDto) {
    try {
      await this.prismaService.empresa.delete({
        where: { id: reqDeleteEmpresa.id },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
