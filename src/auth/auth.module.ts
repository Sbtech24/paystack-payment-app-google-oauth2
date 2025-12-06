import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { GoogleAuthGuard } from './utils/Guards';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/user.entity';

@Module({
    imports:[
        TypeOrmModule.forFeature([Users])
    ],
    controllers:[AuthController],
    providers:[GoogleStrategy,GoogleAuthGuard,{
        provide:'AUTH_SERVICE',
        useClass:AuthService
    }],

})
export class AuthModule {}
