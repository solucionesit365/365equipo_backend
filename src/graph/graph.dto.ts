import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class BookRoomDto {
  @IsEmail()
  roomEmail: string;

  @IsEmail()
  organizerEmail: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // ISO 8601: "2025-09-15T10:00:00"

  @IsString()
  @IsNotEmpty()
  endDate: string;
  @IsEmail({}, { each: true })
  attendees?: string[];
}
