import { Test, TestingModule } from "@nestjs/testing";
import { KpiTiendasController } from "./kpi-tiendas.controller";

describe("KpiTiendasController", () => {
  let controller: KpiTiendasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiTiendasController],
    }).compile();

    controller = module.get<KpiTiendasController>(KpiTiendasController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
