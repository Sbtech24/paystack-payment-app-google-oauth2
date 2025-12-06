import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from "express-session"
import passport from "passport"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(session({
    secret:"random",
    resave:false,
    cookie:{
      maxAge:60000
    },
    saveUninitialized:false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
