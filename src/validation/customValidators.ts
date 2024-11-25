import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from "class-validator";

@ValidatorConstraint({ async: false })
export class MultiTypeValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    return value instanceof Date || typeof value === "string";
  }

  defaultMessage() {
    return "La propiedad $property debe ser de tipo string o Date";
  }
}

export function IsStringOrDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MultiTypeValidator,
    });
  };
}
