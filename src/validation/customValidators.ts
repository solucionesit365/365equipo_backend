import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationArguments,
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

@ValidatorConstraint({ async: false })
export class IsDifferentThanConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    
    // Si alguno es null o undefined, permitir
    if (!value || !relatedValue) {
      return true;
    }
    
    try {
      // Convertir a Date para manejar diferentes formatos ISO
      const valueDate = new Date(value);
      const relatedDate = new Date(relatedValue);
      
      // Verificar si ambas fechas son válidas
      if (isNaN(valueDate.getTime()) || isNaN(relatedDate.getTime())) {
        return false;
      }
      
      // Extraer horas y minutos de las cadenas ISO originales para evitar problemas de zona horaria
      const valueMatch = value.match(/T(\d{2}):(\d{2}):/);
      const relatedMatch = relatedValue.match(/T(\d{2}):(\d{2}):/);
      
      if (valueMatch && relatedMatch) {
        const valueHours = parseInt(valueMatch[1]);
        const valueMinutes = parseInt(valueMatch[2]);
        const relatedHours = parseInt(relatedMatch[1]);
        const relatedMinutes = parseInt(relatedMatch[2]);
        
        // Si ambos son 00:00, es un turno vacío válido
        if (valueHours === 0 && valueMinutes === 0 && relatedHours === 0 && relatedMinutes === 0) {
          return true;
        }
      }
      
      // Para cualquier otro caso, las fechas no deben ser iguales
      return value !== relatedValue;
    } catch (error) {
      // Si hay algún error parseando las fechas, validar como strings
      return value !== relatedValue;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `El horario de inicio y final del turno no pueden ser iguales`;
  }
}

export function IsDifferentThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsDifferentThanConstraint,
    });
  };
}
