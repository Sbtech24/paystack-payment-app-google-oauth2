import { Controller, Get, UseGuards,Req } from "@nestjs/common";
import { GoogleAuthGuard } from "./utils/Guards";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) {}



    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    handleLogin(){
        return {
            msg:"google authentication"
        }
    }

  

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req: any) {
   
   
    const user = await this.authService.validateUser({
  email: req.user.email,
  displayname: req.user.displayName,

  

});
  const jwt = this.authService.generateJwt(user);

 
    return {
      user_id: user.id,
      email: user.email,
      displayname: user.displayname,
      token:jwt
  
    };
  }


}