import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDetails } from "src/utils/types";
import { Repository } from "typeorm";
import { Users } from "src/entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService{
    
    constructor(@InjectRepository(Users)private readonly userRepository:Repository<Users>,
     private readonly jwtService: JwtService,
    

){}
    async validateUser(details:UserDetails){
    console.log('AuthService')
    
    console.log(details)
    const user = await this.userRepository.findOneBy({email:details.email})
    if(user){
        return user
    }

    const newUser = this.userRepository.create(details)
    return this.userRepository.save(newUser)

    }

    async findUser(id:string){
        const user  =  this.userRepository.findOneBy({id})
        console.log(user)
        return user
    }
     generateJwt(user: Users) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
    
}