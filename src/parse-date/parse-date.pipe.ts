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
    const luxonDate = DateTime.fromISO(value);

    if (luxonDate.isValid === false) {
      throw new BadRequestException("Fecha inválida.");
    }
    return luxonDate.toJSDate();
  }
}
