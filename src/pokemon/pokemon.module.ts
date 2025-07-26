import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { Poketmon, UserPoketmon } from "./pokemon.entity";
import { PoketmonSkill } from "./pokemon.skill.entity";
import { PoketmonService } from "./pokemon.service";

@Module({
  providers: [PoketmonService],
  exports: [PoketmonService],
  imports: [TypeOrmModule.forFeature([Poketmon, PoketmonSkill, UserPoketmon])],
})
export class PoketmonModule {}