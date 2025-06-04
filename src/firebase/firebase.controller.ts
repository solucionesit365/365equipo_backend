import { Body, Controller, Post } from "@nestjs/common";
import { UpdateFirebaseDto } from "./firebase.dto";
import { FirebaseService } from "./firebase.service";

@Controller("firebase")
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  //@UseGuards(AuthGuard)
  @Post("update")
  async updateFirebase(@Body() reqUpdateFirebase: UpdateFirebaseDto) {
    await this.firebaseService.updateFirebaseUser(
      {
        email: reqUpdateFirebase.email,
      },
      reqUpdateFirebase.userId,
    );
    return "Ok";
  }
}
