import { Test, TestingModule } from "@nestjs/testing";
import { PerfilHardwareController } from "./perfil-hardware.controller";

describe("PerfilHardwareController", () => {
  let controller: PerfilHardwareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilHardwareController],
    }).compile();

    controller = module.get<PerfilHardwareController>(PerfilHardwareController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
