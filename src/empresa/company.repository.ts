import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  CreateCompanyDto,
  DeleteCompanyDto,
  UpdateCompanyDto,
} from "./empresa.dto";
import { MongoService } from "../mongo/mongo.service";
import {
  CompanyCreate,
  CompanyDelete,
  CompanyInterface,
  CompanyUpdate,
} from "./company.interface";
import { ObjectId, WithId } from "mongodb";
import { ICompanyRepository } from "./ICompany.repository";

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly mongoService: MongoService) {}

  async createCompany(reqCreateCompany: CreateCompanyDto) {
    try {
      const companyCollection =
        await this.mongoService.getCollection<CompanyCreate>("company");
      return await companyCollection.insertOne(reqCreateCompany);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateCompany(reqUpdateCompany: UpdateCompanyDto) {
    try {
      const companyCollection =
        await this.mongoService.getCollection<CompanyUpdate>("company");

      return await companyCollection.updateOne(
        {
          id: reqUpdateCompany.id,
        },
        {
          $set: {
            autogestionada: reqUpdateCompany.autogestionada,
            cif: reqUpdateCompany.cif,
            existsBC: reqUpdateCompany.existsBC,
            idExterno: reqUpdateCompany.idExterno,
            nombre: reqUpdateCompany.nombre,
          },
        },
      );
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getCompanies(
    onlyExistsBC?: boolean,
  ): Promise<WithId<CompanyInterface>[]> {
    try {
      const filter = onlyExistsBC ? { existsBC: true } : {};
      const companyCollection =
        await this.mongoService.getCollection<CompanyInterface>("company");

      return await companyCollection.find({ filter }).toArray();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async deleteCompany(reqDeleteCompany: DeleteCompanyDto): Promise<void> {
    try {
      const companyCollection =
        await this.mongoService.getCollection<CompanyDelete>("company");
      await companyCollection.deleteOne({
        _id: new ObjectId(reqDeleteCompany.id),
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
