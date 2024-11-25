import { Test, TestingModule } from "@nestjs/testing";
import { NotasInformativasController } from "./notas-informativas.controller";

describe("NotasInformativasController", () => {
  let controller: NotasInformativasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotasInformativasController],
    }).compile();

    controller = module.get<NotasInformativasController>(
      NotasInformativasController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
