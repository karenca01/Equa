import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TOKEN_NAME } from './constants/jwt.constants';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(loginDto);

    // guardar la cookie httpOnly
    response.cookie(TOKEN_NAME, token.access_token ?? token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      //secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //'none',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    
    // console.log("Seteando cookie:", TOKEN_NAME, token.access_token);
    return { message: 'Login exitoso'};
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Auth()
  @Get('me')
  async getProfile(@Req() req) {
    // console.log(req.user);
    // return req.user;
    const userId = req.user.id;
    return this.usersService.findOne(userId);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TOKEN_NAME, {
      path: '/',
      sameSite: 'lax',
    });
    return { message: 'Logout exitoso' };
  }
}