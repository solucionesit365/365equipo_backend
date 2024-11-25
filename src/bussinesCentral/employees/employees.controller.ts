import { Controller, Get } from "@nestjs/common";
import { EmployeesClass } from "./employees.class";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesClass: EmployeesClass) {}
  @Get("getEmployees")
  async getEmployees() {
    try {
      const employees = await this.employeesClass.getEmployees();
      return employees;
    } catch (error) {}
  }
}
