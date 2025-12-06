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

  
  // Step 2: Google callback endpoint
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req: any) {
    // GoogleAuthGuard attaches the user info to req.user
    const user = await this.authService.validateUser({
      email: req.user?.emails?.[0]?.value || "",
      displayname: req.user?.displayName || "",
   
    });

 
    return {
      user_id: user.id,
      email: user.email,
      displayname: user.displayname,
  
    };
  }


}