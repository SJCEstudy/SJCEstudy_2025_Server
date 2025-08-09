export class CreateRoomDto {
  boosId: number;

  myPoketmonId: number;
}

export class JoinRoomDto {
  roomId: string;

  myPoketmonId: number;
}

export class LeaveRoomDto {
  roomId: string;
}

export class TestRoomDto {
  roomId: string;

  message: string;
}
