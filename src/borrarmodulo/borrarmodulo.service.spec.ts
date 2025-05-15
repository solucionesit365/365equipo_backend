import { Test, TestingModule } from "@nestjs/testing";
import { BorrarmoduloService } from "./borrarmodulo.service";

describe("BorrarmoduloService", () => {
  let service: BorrarmoduloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrarmoduloService],
    }).compile();

    service = module.get<BorrarmoduloService>(BorrarmoduloService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
