import { Injectable } from "@nestjs/common";
import {
  CreateCompanyDto,
  DeleteCompanyDto,
  UpdateCompanyDto,
} from "./empresa.dto";
import { CompanyInterface } from "./company.interface";
import { WithId } from "mongodb";
import { ICompanyRepository } from "./ICompany.repository";

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  createCompany(reqCreateCompany: CreateCompanyDto) {
    return this.companyRepository.createCompany(reqCreateCompany);
  }

  updateCompany(reqUpdateCompany: UpdateCompanyDto) {
    return this.companyRepository.updateCompany(reqUpdateCompany);
  }

  getCompanies(onlyExistsBC?: boolean): Promise<WithId<CompanyInterface>[]> {
    return this.companyRepository.getCompanies(onlyExistsBC);
  }

  async deleteCompany(reqDeleteCompany: DeleteCompanyDto): Promise<void> {
    return await this.companyRepository.deleteCompany(reqDeleteCompany);
  }
}
