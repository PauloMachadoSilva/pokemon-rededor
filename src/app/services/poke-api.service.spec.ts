import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PokeApiService } from './poke-api.service';

describe('PokeApiService', () => {
  let service: PokeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PokeApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PokeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('filtra tipos desconhecidos e usa cache', () => {
    let firstResult: string[] = [];
    service.getPokemonTypes().subscribe((types) => {
      firstResult = types.map((type) => type.name);
    });

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/type');
    req.flush({
      results: [
        { name: 'fire', url: '' },
        { name: 'unknown', url: '' },
        { name: 'shadow', url: '' },
        { name: 'water', url: '' }
      ]
    });

    expect(firstResult).toEqual(['fire', 'water']);

    let secondResult: string[] = [];
    service.getPokemonTypes().subscribe((types) => {
      secondResult = types.map((type) => type.name);
    });

    httpMock.expectNone('https://pokeapi.co/api/v2/type');
    expect(secondResult).toEqual(['fire', 'water']);
  });

  it('cacheia detalhes por id e nome', () => {
    const detail = {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      abilities: [],
      types: [],
      stats: [],
      sprites: {}
    };

    let firstResult: string | undefined;
    service.getPokemonDetails(1).subscribe((pokemon) => {
      firstResult = pokemon.name;
    });

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
    req.flush(detail);

    expect(firstResult).toBe('bulbasaur');

    let secondResult: number | undefined;
    service.getPokemonDetails('bulbasaur').subscribe((pokemon) => {
      secondResult = pokemon.id;
    });

    httpMock.expectNone('https://pokeapi.co/api/v2/pokemon/bulbasaur');
    expect(secondResult).toBe(1);
  });
});
