// src/room/room.gateway.ts
import {
  ConflictException,
  ForbiddenException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets/interfaces/hooks';
import { Server, Socket } from 'socket.io';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { WsSessionGuard } from 'src/guard/ws.session.guard';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto, JoinRoomDto, LeaveRoomDto, TestRoomDto } from './room.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import { PoketmonService } from 'src/pokemon/pokemon.service';
import { RoomService } from './room.service';

@WebSocketGateway({ namespace: '/rooms', cors: true })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly maxMemberCount = 4;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly poketmonService: PoketmonService,
    private readonly blockchainService: BlockchainService,
  ) {}

  handleConnection(client: Socket) {
    const sessionId = client.handshake.headers['sessionid'];
    if (!sessionId || typeof sessionId !== 'string') {
      client.disconnect();
      return;
    }
    this.redisService.getSession(sessionId).then((session) => {
      if (!session) {
        client.disconnect();
      } else {
        console.log(`Client connected: ${client.id}`);
      }
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client['user'];
    if (user) {
        const userRoom = await this.redisService.getUserRoom(user.seq) || '';
        await this.redisService.leaveRoom(userRoom, user.seq);
        const memberCount = await this.redisService.getMemberCount(userRoom);
        if (memberCount <= 0) {
            await this.redisService.removeRoom(userRoom);
        }
        client.leave(userRoom);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CreateRoomDto,
  ) {
    console.log(body.boosId);
    const user = client['user'];
        console.log(user);

    const userRoom = await this.redisService.getUserRoom(user.seq);
    console.log(userRoom);
    if (userRoom) {
      throw new Error('already member');
    }
    const boss = await this.poketmonService.getPokemonWithSkills(body.boosId);
    console.log(boss);

    if (!boss) {
      throw new Error();
    }
    const myPoketmons = await this.poketmonService.getUserPokemons(user.seq);
        console.log(myPoketmons);

    if (!myPoketmons.some(p => p.poketmonId == body.myPoketmonId)) {
      throw new Error();
    }
    // const roomId = uuidv4();
    const roomId = '2b9e9d3d-ff84-429a-901c-faeeeedd7888';
    await this.redisService.createRoom(roomId, user.seq, boss.id);
    await this.redisService.joinRoom(roomId, user.seq, body.myPoketmonId);
    const updateRoom = await this.roomService.getRoom(roomId, 'createRoom');
        console.log(updateRoom);

    client.join(roomId);

    console.log(updateRoom);
    this.server.to(roomId).emit('roomUpdate', updateRoom);
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinRoomDto,
  ) {
    const user = client['user'];
    const memberCount = await this.redisService.getMemberCount(body.roomId);

    const room = await this.roomService.getRoom(body.roomId, 'joinRoom');
    if (!room) {
      throw new ForbiddenException('room not found');
    }
    if (memberCount >= this.maxMemberCount) {
      throw new ForbiddenException('max member count');
    }
    const userRoom = await this.redisService.getUserRoom(user.id);
    if (userRoom) {
      throw new ConflictException('already member');
    }
    await this.redisService.joinRoom(body.roomId, user.seq, body.myPoketmonId);
    client.join(body.roomId);
    const roomUpdate = await this.roomService.getRoom(body.roomId, 'joinRoom');
    this.server.to(body.roomId).emit('roomUpdate', roomUpdate);
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('testRoom')
  async handleTestRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: TestRoomDto,
  ) {
    this.server.to(body.roomId).emit('roomUpdate', body.message);
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: LeaveRoomDto,
  ) {
    const user = client['user'];

    console.log(body.roomId);
    console.log(user.seq);

    const isMember = await this.redisService.isMember(
      body.roomId,
      String(user.seq),
    );

    console.log(isMember);

    if (!isMember) {
      throw new Error('not member');
    }
    await this.redisService.leaveRoom(body.roomId, user.seq);
    const room = await this.roomService.getRoom(body.roomId, 'leaveRoom');
    
    const memberCount = await this.redisService.getMemberCount(body.roomId);
    let roomUpdate = {};
    if (memberCount <= 0) {
      await this.redisService.removeRoom(body.roomId);
      roomUpdate = {
        ...room,
        members: []
      }
    } else {
      roomUpdate = await this.roomService.getRoom(body.roomId, 'leaveRoom');
    }
    this.server.to(body.roomId).emit('roomUpdate', roomUpdate);
    client.leave(body.roomId);
    return room;
  }

}