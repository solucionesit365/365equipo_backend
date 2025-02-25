import { Controller, Post, Get, Body, UseGuards, Query } from "@nestjs/common";
import { NotificacionHorasExtrasClass } from "./notificacion-horas-extras.class";
import { TNotificacionHorasExtras } from "./notificacion-horas-extras.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("notificacion-horas-extras")
export class NotificacionHorasExtrasController {
  constructor(
    private readonly shNotificacionhorasExtras: NotificacionHorasExtrasClass,
  ) {}

  @UseGuards(AuthGuard)
  @Post("createNotificacionHorasExtras")
  createNotificacionHorasExtras(@Body() data: TNotificacionHorasExtras) {
    try {
      return this.shNotificacionhorasExtras.createNotificacionHorasExtras(data);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllNotificacionesHorasExtras")
  getAllNotificacionesHorasExtras() {
    try {
      return this.shNotificacionhorasExtras.getAllNotificacionesHorasExtras();
    } catch (error) {
      console.log(error);
    }
  }
  @UseGuards(AuthGuard)
  @Get("getNotificacionHorasExtrasByIdSql")
  getNotificacionHorasExtrasByIdSql(@Query() { idSql }) {
    try {
      // console.log(idSql)

      return this.shNotificacionhorasExtras.getNotificacionHorasExtrasByIdSql(
        Number(idSql),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
