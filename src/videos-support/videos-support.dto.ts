import { IsNotEmpty, IsString } from "class-validator";
import { IsYoutubeUrl } from "./youtube-validator";

export class CreateVideoSupportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsYoutubeUrl()
  url: string;

  embededUrl(): string {
    return this.generateEmbededUrl(this.url);
  }

  private generateEmbededUrl(url: string): string {
    const regex = /(?:(?:v=)|(?:\/embed\/)|(?:\.be\/))([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}`;
    } else {
      throw new Error("URL de YouTube no válida");
    }
  }
}

export class CreateVideoSupport {
  title: string;
  url: string;  
  embededUrl: string;

  constructor(title: string, url: string, embededUrl: string) {
    this.title = title;
    this.url = url;
    this.embededUrl = embededUrl;
  }
}
