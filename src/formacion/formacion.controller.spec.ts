import { Test, TestingModule } from "@nestjs/testing";
import { FormacionController } from "./formacion.controller";

describe("FormacionController", () => {
  let controller: FormacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormacionController],
    }).compile();

    controller = module.get<FormacionController>(FormacionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
