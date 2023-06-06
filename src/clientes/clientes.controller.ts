import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
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
import { nuevoCliente } from "./clientes.mssql";

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
      ),
    };
  }

  @Get("confirmarEmail")
  async confirmarEmail(@Query("idSolicitud") idSolicitud: string) {
    try {
      if (!idSolicitud) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.clientesInstance.confirmarEmail(idSolicitud),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
