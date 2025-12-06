import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { GoogleAuthGuard } from './utils/Guards';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/user.entity';
import { Transactions } from '../entities/transaction.entity';
import { SessionSerilizer } from './utils/Serilizer';

@Module({
    imports:[
        TypeOrmModule.forFeature([Users,Transactions])
    ],
    controllers:[AuthController],
    providers:[GoogleStrategy,AuthService, SessionSerilizer,GoogleAuthGuard,{
        provide:'AUTH_SERVICE',
        useClass:AuthService,
    
    }],

})
export class AuthModule {}
