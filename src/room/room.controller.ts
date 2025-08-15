import { Controller, Get, UseGuards } from '@nestjs/common';
import { HttpSessionGuard } from 'src/guard/http.session.guard';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @UseGuards(HttpSessionGuard)
  async getRooms() {
    return await this.roomService.getRooms();
  }
}