import { Controller, Get, UseGuards } from "@nestjs/common";
import { GoogleAuthGuard } from "./utils/Guards";

@Controller('auth')
export class AuthController{

    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    handleLogin(){
        return {
            msg:"google authentication"
        }
    }

    // /api/auth/google/redirect
    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    handleRedirect(){
        return {
            msg:"redirect url"
        }
    }

}