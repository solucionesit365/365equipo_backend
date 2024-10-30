import { Controller, UseGuards, Post, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreatePresentationDto,
  DeletePresentationDto,
  GetPresentationDto,
  UpdatePresentationDto,
} from "./presentation.dto";
import { PresentationService } from "./presentation.service";

@Controller("presentation")
export class PresentationController {
  constructor(private readonly presentacionService: PresentationService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getPresentations() {
    return await this.presentacionService.getPresentations();
  }

  @UseGuards(AuthGuard)
  @Get("presentation")
  async getPresentation(@Query() req: GetPresentationDto) {
    return await this.presentacionService.getPresentation(req.id);
  }

  @UseGuards(AuthGuard)
  @Post("create")
  async createPresentation(@Body() presentation: CreatePresentationDto) {
    return await this.presentacionService.createPresentation(presentation);
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deletePresentation(@Body() req: DeletePresentationDto) {
    return await this.presentacionService.deletePresentation(req.id);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updatePresentation(@Body() req: UpdatePresentationDto) {
    return await this.presentacionService.updatePresentation(req.id, req);
  }
}
