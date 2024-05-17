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

      const issuerId = "3388000000022232953";
      const classId = `${issuerId}.tarjetas-cliente`;

      const walletUrl = await this.clientesInstance.confirmarEmail(
        idSolicitud,
        issuerId,
        classId,
      );
      if (walletUrl) return res.render("verificado", { walletUrl });
      else throw Error("Error de verificación de email");
    } catch (err) {
      console.log(err);
      return res.render("falloVerificado");
    }
  }

  @Get("test")
  async testClientQr() {
    try {
      const issuerId = "3388000000022232953";
      const classId = `${issuerId}.tarjetas-cliente`;

      //await this.clientesInstance.createPassClass(classId);
      return await this.clientesInstance.createPassObject(
        "QRCLIENT",
        "Ezequiel C.O",
        issuerId,
        classId,
      );
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getClientesRegistrados")
  async getAllFlayers() {
    try {
      const response = await this.clientesInstance.getAllFlayers();
      if (response.length > 0) {
        return {
          ok: true,
          data: response,
        };
      } else
        return {
          ok: false,
          data: "No hay clientes registrados",
        };
    } catch (error) {
      return {
        ok: false,
        data: error,
      };
    }
  }

  @Get("validarFlayer")
  async validarFlayer(@Query("codigo") codigo: string) {
    try {
      const response = await this.clientesInstance.validarFlayer(codigo);

      if (response) {
        if (!response.caducado) {
          await this.clientesInstance.caducarFlayer(codigo);
        }
        return {
          ok: true,
          data: response,
        };
      } else
        return {
          ok: false,
          data: "No hay flayer con este QR",
        };
    } catch (error) {}
  }

  @Get("updateAll")
  async caducarFlayer(@Query("codigo") codigo: string) {
    try {
      const response = await this.clientesInstance.caducarFlayer(codigo);

      if (response)
        return {
          ok: true,
          data: response,
        };

      throw Error("No se ha podido modificar el codigo");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
