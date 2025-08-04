import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../../guards/firebase-auth.guard";
import { UpdateResponsableDeLaTiendaUseCase } from "../use-cases/UpdateResponsableDeLaTienda.use-case";

interface UpdateResponsableDeLaTiendaDto {
  idTienda: number;
  idCoordinadora: number;
}

@Controller("subordinado")
export class UpdateResponsableDeLaTiendaController {
  constructor(
    private readonly updateResponsableUseCase: UpdateResponsableDeLaTiendaUseCase,
  ) {}

  @Post("update-responsable-de-la-tienda")
  @UseGuards(FirebaseAuthGuard)
  async updateResponsableDeLaTienda(@Body() dto: UpdateResponsableDeLaTiendaDto) {
    try {
      const result = await this.updateResponsableUseCase.execute(
        dto.idTienda,
        dto.idCoordinadora,
      );
      
      return {
        ok: true,
        data: result,
      };
    } catch (error) {
      console.error("Error actualizando responsables:", error);
      return {
        ok: false,
        message: error.message || "Error al actualizar responsables de la tienda",
      };
    }
  }
}