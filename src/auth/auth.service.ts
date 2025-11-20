import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Login
  async login(loginDto: LoginDto) {
    const { userEmail, userPassword } = loginDto;
    const user = await this.usersService.findByEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    console.log(JSON.stringify(user));

    const passwordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!passwordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Generar JWT
    const payload = { sub: user.userId, email: user.userEmail, username: user.username, userFullName: user.userFullName, userCreatedEvents: user.createdEvents, userJoinedEvents: user.joinedEvents };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Registro (opcional)
  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.userPassword, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      userPassword: hashedPassword,
    });

    const payload = { sub: user.userId, email: user.userEmail };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}