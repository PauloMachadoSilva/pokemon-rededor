import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, catchError } from 'rxjs';
import {
  NamedApiResource,
  PokemonByTypeResponse,
  PokemonDetail,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeListResponse
} from '../models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokeApiService {
  private readonly api = 'https://pokeapi.co/api/v2';
  private allPokemonCache?: NamedApiResource[];
  private typesCache?: NamedApiResource[];
  private typePokemonCache = new Map<string, NamedApiResource[]>();
  private pokemonCache = new Map<string, PokemonDetail>();

  constructor(private http: HttpClient) {}

  getAllPokemonList(): Observable<NamedApiResource[]> {
    if (this.allPokemonCache) {
      return of(this.allPokemonCache);
    }

    return this.http
      .get<PokemonListResponse>(`${this.api}/pokemon?limit=2000&offset=0`)
      .pipe(
        map((response) => response.results),
        tap((results) => {
          this.allPokemonCache = results;
        })
      );
  }

  getPokemonTypes(): Observable<NamedApiResource[]> {
    if (this.typesCache) {
      return of(this.typesCache);
    }

    return this.http.get<PokemonTypeListResponse>(`${this.api}/type`).pipe(
      map((response) =>
        response.results.filter(
          (type) => type.name !== 'unknown' && type.name !== 'shadow'
        )
      ),
      tap((results) => {
        this.typesCache = results;
      })
    );
  }

  getPokemonListByType(type: string): Observable<NamedApiResource[]> {
    if (type === 'all') {
      return this.getAllPokemonList();
    }

    const cached = this.typePokemonCache.get(type);
    if (cached) {
      return of(cached);
    }

    return this.http.get<PokemonByTypeResponse>(`${this.api}/type/${type}`).pipe(
      map((response) => response.pokemon.map((entry) => entry.pokemon)),
      tap((results) => {
        this.typePokemonCache.set(type, results);
      })
    );
  }

  getPokemonDetails(nameOrId: string | number): Observable<PokemonDetail> {
    const key = String(nameOrId).toLowerCase();
    const cached = this.pokemonCache.get(key);
    if (cached) {
      return of(cached);
    }

    return this.http.get<PokemonDetail>(`${this.api}/pokemon/${key}`).pipe(
      tap((detail) => {
        this.pokemonCache.set(String(detail.id), detail);
        this.pokemonCache.set(detail.name.toLowerCase(), detail);
      })
    );
  }

  getPokemonSpecies(nameOrId: string | number): Observable<PokemonSpecies | null> {
    const key = String(nameOrId).toLowerCase();
    return this.http.get<PokemonSpecies>(`${this.api}/pokemon-species/${key}`).pipe(
      catchError(() => of(null))
    );
  }

  getPokemonImage(detail: PokemonDetail): string | null {
    return (
      detail.sprites?.other?.['official-artwork']?.front_default ??
      detail.sprites?.other?.home?.front_default ??
      detail.sprites?.front_default ??
      null
    );
  }
}
