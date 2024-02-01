import { Test, TestingModule } from "@nestjs/testing";
import { ContratoService } from "./contrato.service";

describe("ContratoService", () => {
  let service: ContratoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContratoService],
    }).compile();

    service = module.get<ContratoService>(ContratoService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
