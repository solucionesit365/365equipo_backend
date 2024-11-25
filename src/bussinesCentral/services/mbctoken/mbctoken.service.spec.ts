import { Test, TestingModule } from "@nestjs/testing";
import { MbctokenService } from "./mbctoken.service";

describe("MbctokenService", () => {
  let service: MbctokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MbctokenService],
    }).compile();

    service = module.get<MbctokenService>(MbctokenService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
