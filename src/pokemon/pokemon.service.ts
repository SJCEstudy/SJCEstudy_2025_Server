import { InjectRepository } from "@nestjs/typeorm";
import { Poketmon, UserPoketmon } from "./pokemon.entity";
import { PoketmonSkill } from "./pokemon.skill.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PoketmonService {
  constructor(
    @InjectRepository(Poketmon)
    private pokemonRepo: Repository<Poketmon>,
    @InjectRepository(PoketmonSkill)
    private pokemonSkillRepo: Repository<PoketmonSkill>,
    @InjectRepository(UserPoketmon)
    private userPokemonRepo: Repository<UserPoketmon>,
  ) {}
  
  async getUserPokemons(userSeq: number) {
    const userPokemons = await this.userPokemonRepo.find({
      where: { user_seq: userSeq },
    });

    const results = await Promise.all(
      userPokemons.map(async (up) => {
        const pokemon = await this.pokemonRepo.findOne({
          where: { id: up.pokemon_id },
        });
        const skills = await this.pokemonSkillRepo.find({
          where: { pokemon_id: up.pokemon_id },
        });

        return {
          poketmonId: up.pokemon_id,
          name: pokemon?.name,
          hp: pokemon?.hp,
          skills,
        };
      }),
    );

    return results;
  }


}