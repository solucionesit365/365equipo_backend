import { Test, TestingModule } from "@nestjs/testing";
import { ArchivoDigitalController } from "./archivo-digital.controller";

describe("ArchivoDigitalController", () => {
  let controller: ArchivoDigitalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivoDigitalController],
    }).compile();

    controller = module.get<ArchivoDigitalController>(ArchivoDigitalController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
