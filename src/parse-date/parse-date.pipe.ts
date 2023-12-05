import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Date {
    console.log("eo:", value);
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException("Fecha inválida.");
    }
    return date;
  }
}
