import { Test, TestingModule } from "@nestjs/testing";
import { SolicitudVacacionesController } from "./solicitud-vacaciones.controller";

describe("SolicitudVacacionesController", () => {
  let controller: SolicitudVacacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudVacacionesController],
    }).compile();

    controller = module.get<SolicitudVacacionesController>(
      SolicitudVacacionesController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
