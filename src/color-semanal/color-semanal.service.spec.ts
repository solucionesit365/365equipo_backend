import { Test, TestingModule } from "@nestjs/testing";
import { ColorSemanalService } from "./color-semanal.service";

describe("ColorSemanalService", () => {
  let service: ColorSemanalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColorSemanalService],
    }).compile();

    service = module.get<ColorSemanalService>(ColorSemanalService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
