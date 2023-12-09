import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from "@nestjs/common";
import { DateTime } from "luxon";

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Date {
    const luxonDate = DateTime.fromISO("2023-05-15T04:03:00.000+00:00");
    console.log("luxon date es: ", luxonDate.isValid);
    if (luxonDate.isValid === false) {
      throw new BadRequestException("Fecha inválida.");
    }
    return luxonDate.toJSDate();
  }
}
