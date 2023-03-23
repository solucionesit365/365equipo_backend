import { Test, TestingModule } from "@nestjs/testing";
import { AnunciosController } from "./anuncios.controller";

describe("AnunciosController", () => {
  let controller: AnunciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnunciosController],
    }).compile();

    controller = module.get<AnunciosController>(AnunciosController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
