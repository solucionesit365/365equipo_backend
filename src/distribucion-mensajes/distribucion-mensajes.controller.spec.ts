import { Test, TestingModule } from "@nestjs/testing";
import { DistribucionMensajesController } from "./distribucion-mensajes.controller";

describe("DistribucionMensajesController", () => {
  let controller: DistribucionMensajesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistribucionMensajesController],
    }).compile();

    controller = module.get<DistribucionMensajesController>(
      DistribucionMensajesController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
