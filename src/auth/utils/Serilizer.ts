import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Inject, Injectable } from "@nestjs/common";
import { Users } from "src/entities/user.entity";


@Injectable()
export class SessionSerilizer extends PassportSerializer{
    constructor(
        @Inject('AUTH_SERVICE') private readonly authservice:AuthService
    ){
        super()
    }

    serializeUser(user: Users, done: Function) {
            done(null,user);
        
        
    }

    async deserializeUser(payload: any, done: Function) {
      const user =  await this.authservice.findUser(payload.id)
    return user ? done(null,user) : done(null,null)
    
    }
        
       

    
}