import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Color } from "./color-semanal.dto";
import { $Enums } from "@prisma/client";

@Injectable()
export class ColorSemanalService {
  constructor(private readonly prisma: PrismaService) {}

  async saveColorOut(color: Color) {
    return await this.prisma.color.update({
      where: {
        id: "SALE_COLOR",
      },
      data: {
        value: color,
      },
    });
  }

  async getColors() {
    const colorOut = (
      await this.prisma.color.findUnique({
        where: {
          id: "SALE_COLOR",
        },
      })
    ).value;

    const colorIn = this.getColorIn(colorOut);

    return { colorOut, colorIn };
  }

  getColorIn(colorOut: $Enums.ColorSemanal) {
    switch (colorOut) {
      case Color.Green:
        return "brown";
      case Color.Orange:
        return "green";
      case Color.Blue:
        return "orange";
      case Color.Brown:
        return "blue";
    }
  }
}
