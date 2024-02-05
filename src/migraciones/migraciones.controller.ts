// import { Controller, Post } from "@nestjs/common";
// import { MigracionesService } from "./migraciones.service";

// @Controller("migraciones")
// export class MigracionesController {
//   constructor(private readonly migracionesService: MigracionesService) {}

//   @Post("tiendas")
//   async tiendasSqlServerToMysql() {
//     try {
//       return (
//         "Traspasadas: " +
//         (await this.migracionesService.tiendasSqlServerToMysql()) +
//         " tiendas"
//       );
//     } catch (err) {
//       console.log(err);
//       return "Error";
//     }
//   }

//   @Post("trabajadores")
//   async trabajadoresSqlServerToMysql() {
//     try {
//       const nTrabajadores =
//         await this.migracionesService.trabajadoresSqlServerToMysql();
//       return "OK: " + nTrabajadores + " trabajadores";
//     } catch (err) {
//       console.log(err);
//       return "Error";
//     }
//   }

//   @Post("trabajadores:update")
//   async trabajadoresSqlServerToMysqlUpdate() {
//     try {
//       const nTrabajadores = await this.migracionesService.updateResponsables();
//       return "OK: " + nTrabajadores + " trabajadores actualizados";
//     } catch (err) {
//       console.log(err);
//       return "Error";
//     }
//   }

//   @Post("contratos")
//   async contratosSqlServerToMysql() {
//     try {
//       return await this.migracionesService.contratosSqlServerToMysql();
//       return "OK";
//     } catch (err) {
//       console.log(err);
//       return "Error";
//     }
//   }
// }
