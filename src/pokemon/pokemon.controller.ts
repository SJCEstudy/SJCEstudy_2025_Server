  import { Controller, Get, Req } from "@nestjs/common";
  import { PoketmonService } from "./pokemon.service";


  @Controller('pokemons')
  export class PokemonController {
    constructor(
      private readonly pokemonService: PoketmonService,
    ) {}

    @Get('all')
    async getBalance(@Req() req: any) {
      return this.pokemonService.getAllPokemonWithSkills();
    }

  }