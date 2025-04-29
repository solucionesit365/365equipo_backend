import { Controller } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";

@Controller("firebase")
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  // @Post("test")
  // async test() {
  //   await this.firebaseService.test();
  //   return;
  // }
}
