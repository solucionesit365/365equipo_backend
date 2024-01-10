import { Injectable } from "@nestjs/common";
import { MbctokenService } from "../../bussinesCentral/services/mbctoken/mbctoken.service";
import * as baseDatos from "./employees.mssql";
import axios from "axios";
@Injectable()
export class EmployeesClass {
  constructor(private readonly MbctokenService: MbctokenService) {}

  async getEmployees() {
    try {
      const token = await this.MbctokenService.getToken();

      //get Employees ?$filter=number eq '4071'
      let response = await axios.get(
        `${process.env.MCB_BASE_URL}/v2.0/${process.env.MBC_TOKEN_TENANT}/production/api/v2.0/companies(${process.env.MBC_COMPANYID})/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.value.length > 0) {
        await baseDatos.addEmployees(response.data.value);
        return {
          ok: true,
          data: "Usuarios obtenidos",
        };
      } else {
        return {
          ok: false,
          data: "No hay usuarios que consultar",
        };
      }
    } catch (error) {
      return {
        status: 400,
        message: error.message,
      };
    }
  }
}
