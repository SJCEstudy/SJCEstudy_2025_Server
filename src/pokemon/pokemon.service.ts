import { InjectRepository } from "@nestjs/typeorm";
import { Poketmon, UserPoketmon } from "./pokemon.entity";
import { PoketmonSkill } from "./pokemon.skill.entity";
import { BadRequestException } from "@nestjs/common/exceptions";
import { Injectable } from "@nestjs/common/decorators";
import { Repository } from "typeorm";

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

    async giveStarterPokemon(userSeq: number) {
    const starter = await this.pokemonRepo.findOne({
      where: { id: 1 },
    });
    if (!starter) throw new BadRequestException('Starter Pokemon not found');

    const userPokemon = this.userPokemonRepo.create({
      user_seq: userSeq,
      pokemon_id: starter.id,
    });

    return this.userPokemonRepo.save(userPokemon);
  }

    async givePokemon(userSeq: number, pokemonId: number) {
    const pokemon = await this.pokemonRepo.findOne({
      where: { id: pokemonId },
    });
    if (!pokemon) throw new BadRequestException('Pokemon not found');

    const userPokemon = this.userPokemonRepo.create({
      user_seq: userSeq,
      pokemon_id: pokemon.id,
    });

    return this.userPokemonRepo.save(userPokemon);
  }

  async getAllPokemonWithSkills() {
    const pokemons = await this.pokemonRepo.find();
    if (!pokemons) new Error ("no pokemon");

    return await Promise.all(pokemons.map(async p => {
      const skills = await this.pokemonSkillRepo.find({
        where: { pokemon_id: p.id },
      });
      return {
        ...p,
        skills: skills,
      };
    }));

  }

  async getPokemonWithSkills(id: number) {
    const pokemon = await this.pokemonRepo.findOne({ where: { id } });
    if (!pokemon) return null;

    const skills = await this.pokemonSkillRepo.find({
      where: { pokemon_id: pokemon.id },
    });

    return {
      ...pokemon,
      skills: skills,
    };
  }

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