import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CompanyService } from "./empresa.service";
import {
  CreateCompanyDto,
  DeleteCompanyDto,
  UpdateCompanyDto,
} from "./empresa.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("empresa")
export class CompanyController {
  constructor(private readonly empresaService: CompanyService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createCompany(@Body() reqCreateCompany: CreateCompanyDto) {
    return await this.empresaService.createCompany(reqCreateCompany);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateCompany(@Body() reqUpdateCompany: UpdateCompanyDto) {
    return await this.empresaService.updateCompany(reqUpdateCompany);
  }

  @UseGuards(AuthGuard)
  @Get("get")
  async getCompanys() {
    return await this.empresaService.getCompanies();
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteCompany(@Body() reqDeleteCompany: DeleteCompanyDto) {
    return await this.empresaService.deleteCompany(reqDeleteCompany);
  }
}
