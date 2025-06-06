import { Test, TestingModule } from "@nestjs/testing";
import { NotificacionRepositoryService } from "./notificacion.repository.service";

describe("NotificacionRepositoryService", () => {
  let service: NotificacionRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificacionRepositoryService],
    }).compile();

    service = module.get<NotificacionRepositoryService>(
      NotificacionRepositoryService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
