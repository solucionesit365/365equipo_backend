import { Test, TestingModule } from "@nestjs/testing";
import { QuestionCategoryController } from "./question-category.controller";

describe("QuestionCategoryController", () => {
  let controller: QuestionCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionCategoryController],
    }).compile();

    controller = module.get<QuestionCategoryController>(
      QuestionCategoryController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
