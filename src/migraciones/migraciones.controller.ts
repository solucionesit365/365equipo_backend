import { Controller, Post } from "@nestjs/common";
import { MigracionesService } from "./migraciones.service";

@Controller("migraciones")
export class MigracionesController {
  constructor(private readonly migracionesService: MigracionesService) {}

  @Post("tiendas")
  async tiendasSqlServerToMysql() {
    try {
      await this.migracionesService.tiendasSqlServerToMysql();
      return "OK";
    } catch (err) {
      console.log(err);
      return "Error";
    }
  }

  @Post("trabajadores")
  async trabajadoresSqlServerToMysql() {
    try {
      await this.migracionesService.trabajadoresSqlServerToMysql();
      return "OK";
    } catch (err) {
      console.log(err);
      return "Error";
    }
  }

  @Post("contratos")
  async contratosSqlServerToMysql() {
    try {
      return await this.migracionesService.contratosSqlServerToMysql();
      return "OK";
    } catch (err) {
      console.log(err);
      return "Error";
    }
  }
}
