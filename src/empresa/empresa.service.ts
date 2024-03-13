import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateEmpresaDto, UpdateEmpresaDto } from "./empresa.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmpresaService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEmpresa(reqCreateEmpresa: CreateEmpresaDto) {
    try {
      const empresa = await this.prismaService.empresa.create({
        data: {
          nombre: reqCreateEmpresa.nombre,
          cif: reqCreateEmpresa.cif,
          idExterno: reqCreateEmpresa.idExterno
            ? reqCreateEmpresa.idExterno
            : null,
        },
      });
      return empresa;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateEmpresa(reqUpdateEmpresa: UpdateEmpresaDto) {
    try {
      const empresa = await this.prismaService.empresa.update({
        where: { id: reqUpdateEmpresa.id },
        data: {
          nombre: reqUpdateEmpresa.nombre,
          cif: reqUpdateEmpresa.cif,
          idExterno: reqUpdateEmpresa.idExterno
            ? reqUpdateEmpresa.idExterno
            : null,
        },
      });
      return empresa;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
