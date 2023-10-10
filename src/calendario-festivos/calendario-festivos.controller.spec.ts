import { Test, TestingModule } from "@nestjs/testing";
import { CalendarioFestivosController } from "./calendario-festivos.controller";

describe("CalendarioFestivosController", () => {
  let controller: CalendarioFestivosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarioFestivosController],
    }).compile();

    controller = module.get<CalendarioFestivosController>(
      CalendarioFestivosController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
