import { InsertOneResult, UpdateResult, WithId } from "mongodb";
import {
  CompanyCreate,
  CompanyInterface,
  CompanyUpdate,
} from "./company.interface";
import {
  CreateCompanyDto,
  DeleteCompanyDto,
  UpdateCompanyDto,
} from "./empresa.dto";

export abstract class ICompanyRepository {
  abstract createCompany(
    reqCreateCompany: CreateCompanyDto,
  ): Promise<InsertOneResult<CompanyCreate>>;

  abstract updateCompany(
    reqUpdateCompany: UpdateCompanyDto,
  ): Promise<UpdateResult<CompanyUpdate>>;

  abstract getCompanies(
    onlyExistsBC?: boolean,
  ): Promise<WithId<CompanyInterface>[]>;

  abstract deleteCompany(reqDeleteCompany: DeleteCompanyDto): Promise<void>;
}
