// src/common/validators/is-youtube-url.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
 
export function IsYoutubeUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isYoutubeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Regex para validar URLs de YouTube
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
          return youtubeRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'La URL debe ser un video válido de YouTube';
        }
      }
    });
  };
}