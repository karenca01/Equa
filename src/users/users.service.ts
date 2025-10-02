import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    this.userRepository.findOneBy({ userId: id });
  }

  findByUsername(username: string) {
    const user = this.userRepository.findOneBy({ username: username });

    if (!user) throw new NotFoundException(`No se encuentra el usuario: ${name}`);
    return user;
  }

  findByEmail(email: string) {
    const user = this.userRepository.findOneBy({ userEmail: email });

    if (!user) throw new NotFoundException(`No se encuentra el usuario: ${email}`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.preload({
      userId: id,
      ...updateUserDto,
    })

    if (!userToUpdate) throw new NotFoundException(`No se encuentra el usuario: ${id}`); 
    this.userRepository.save(userToUpdate);
    return userToUpdate;
  }

  remove(id: string) {
    this.userRepository.delete({ userId: id });

    return {
      message: `El empleado con id ${id} fue eliminado`
    }
  }
}