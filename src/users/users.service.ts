import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like } from 'typeorm';

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

  // async findOne(id: string) {
  //   console.log("buscando el usuario con id", id);
  //   const user = await this.userRepository.findOne({ 
  //     where: { userId: id },
  //     relations: ['createdEvents', 'joinedEvents']
  //    });
  //   // console.log("usuario encontrado", user);

  //   if (!user) throw new NotFoundException(`No se encuentra el usuario: ${id}`);

  //   const { userId, userPassword, ...rest } = user;
  //   return {userId, ...rest};
  // }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { userId: id },
      relations: ['createdEvents', 'joinedEvents']
    });

    if (!user) throw new NotFoundException(`No se encuentra el usuario: ${id}`);

    const { userId, createdEvents, joinedEvents, ...rest } = user;
    // const { userId, userPassword, createdEvents, joinedEvents, ...rest } = user;

    return {
      userId,
      ...rest,
      createdEvents: createdEvents?.map(ev => ev.eventId) || [],
      joinedEvents: joinedEvents?.map(ev => ev.eventId) || []
    };
  }


  async findByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username: username });

    if (!user) throw new NotFoundException(`No se encuentra el usuario: ${username}`);
    return user;
  }

  async searchUsers(query: string) {
    if (!query || query.trim() === "") return [];
    
    return this.userRepository.find({
      where: [
        { username: Like(`%${query}%`) },
        { userEmail: Like(`%${query}%`) }
      ],
      take: 10,
    });
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