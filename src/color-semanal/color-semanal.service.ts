import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Color } from "./color-semanal.dto";
import { $Enums } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class ColorSemanalService {
  constructor(private readonly prisma: PrismaService) {}

  async saveColorIn(color: Color) {
    return await this.prisma.color.update({
      where: {
        id: "ENTRA_COLOR",
      },
      data: {
        value: color,
      },
    });
  }

  async getColors() {
    const colorData = await this.prisma.color.findUnique({
      where: {
        id: "ENTRA_COLOR",
      },
    });

    const colorIn = colorData.value;
    const colorOut = this.getColorOut(colorIn);

    return {
      colorOut,
      colorIn,
      updatedAt: DateTime.fromJSDate(colorData.updatedAt).toISO(),
    };
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

  // Nueva para Jesus
  getColorOut(colorIn: $Enums.ColorSemanal) {
    switch (colorIn) {
      case Color.Brown:
        return "green";
      case Color.Green:
        return "orange";
      case Color.Orange:
        return "blue";
      case Color.Blue:
        return "brown";
    }
  }
}
