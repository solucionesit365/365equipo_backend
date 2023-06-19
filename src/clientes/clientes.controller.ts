import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  Res,
} from "@nestjs/common";
// import { NewClientRequest } from "./clientes.interface";
import {
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsString,
  IsNumber,
  IsOptional,
} from "class-validator";
import { ClientesService } from "./clientes.service";
import { Response } from "express";

class NewClientRequest {
  @IsEmail()
  email: string;

  @IsBoolean()
  nuevoCliente: boolean;

  @IsBoolean()
  newsletter: boolean;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;
}

@Controller("clientes")
export class ClientesController {
  constructor(private readonly clientesInstance: ClientesService) {}

  @Post("clientsForm")
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  )
  async clientsForm(@Body() data: NewClientRequest) {
    if (
      data.nuevoCliente &&
      (!data.nombre || !data.apellidos || !data.telefono || !data.codigoPostal)
    ) {
      throw new BadRequestException(
        "Faltan datos necesarios para nuevo cliente",
      );
    }

    return {
      ok: true,
      data: await this.clientesInstance.handleForm(
        data.nuevoCliente,
        data.newsletter,
        data.email,
        data.nombre,
        data.apellidos,
        data.telefono,
        data.codigoPostal,
      ),
    };
  }

  @Get("confirmarEmail")
  async confirmarEmail(
    @Query("idSolicitud") idSolicitud: string,
    @Res() res: Response,
  ) {
    try {
      if (!idSolicitud) throw Error("Faltan parámetros");

      const walletUrl = await this.clientesInstance.confirmarEmail(idSolicitud);
      if (walletUrl) return res.render("verificado", { walletUrl });

      throw Error("Error de verificación de email");
    } catch (err) {
      return res.render("falloVerificado");
    }
  }
}
