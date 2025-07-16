import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FaqService } from "./faq.service";
import { CreateFaqDto } from "./faq.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("faq")
export class FaqController {
  constructor(private readonly faqService: FaqService) {}
  @UseGuards(AuthGuard)
  @Post("nueva-pregunta")
  newPregunta(@Body() pregunta: CreateFaqDto) {
    return this.faqService.newPregunta({
      answer: pregunta.answer,
      question: pregunta.question,
    });
  }
  @UseGuards(AuthGuard)
  @Get()
  getPreguntas() {
    return this.faqService.getPreguntas();
  }
}
