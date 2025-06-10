import { Body, Controller, Post } from "@nestjs/common";
import { FormularioContacto } from "./contacto.dto";

@Controller("contacto")
export class ContactoController {
  @Post("formulario")
  recibirMensaje(@Body() body: FormularioContacto) {
    console.log("Mensaje recibido del formulario:", body);
    return { mensaje: "Mensaje recibido correctamente" };
  }
}
