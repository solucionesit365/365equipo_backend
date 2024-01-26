import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
} from "@nestjs/common";
import { EmployeesClass } from "./employees.class";
@Controller("employees")
export class EmployeesController {
  constructor(private readonly EmployeesClass: EmployeesClass) {}
  @Get("getEmployees")
  async getEmployees() {
    try {
      const employees = await this.EmployeesClass.getEmployees();
      return employees;
    } catch (error) {}
  }
}
