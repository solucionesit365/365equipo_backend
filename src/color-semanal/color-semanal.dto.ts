import { IsEnum, IsNotEmpty } from "class-validator";

// Definimos un enum con los valores permitidos para el color
export enum Color {
  Green = "green",
  Orange = "orange",
  Blue = "blue",
  Brown = "brown",
}

class ColorValidation {
  @IsNotEmpty({ message: "El campo 'color' no puede estar vacío." })
  @IsEnum(Color, {
    message:
      "El valor del color debe ser 'green', 'orange', 'blue', o 'brown'.",
  })
  color: Color;
}

export default ColorValidation;
