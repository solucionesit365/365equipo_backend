import { Test, TestingModule } from "@nestjs/testing";
import { VerificacionmfaController } from "./verificacionmfa.controller";

describe("VerificacionmfaController", () => {
  let controller: VerificacionmfaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificacionmfaController],
    }).compile();

    controller = module.get<VerificacionmfaController>(
      VerificacionmfaController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
