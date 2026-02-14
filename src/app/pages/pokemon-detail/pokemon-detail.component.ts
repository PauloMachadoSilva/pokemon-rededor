import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../seo/seo.service';
import { getSeoTags } from '../../seo/seo-tags';
import { SeoRoute } from '../../seo/seo-routes';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { PokeApiService } from '../../services/poke-api.service';
import { PokemonDetail, PokemonSpecies } from '../../models/pokemon';
import { TYPE_COLORS, TYPE_LABELS } from '../../utils/pokemon-types';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  pokemon: PokemonDetail | null = null;
  species: PokemonSpecies | null = null;
  isLoading = true;
  errorMessage = '';

  readonly typeLabels = TYPE_LABELS;
  readonly typeColors = TYPE_COLORS;
  readonly statLabels: Partial<Record<string, string>> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defesa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defesa Especial',
    speed: 'Velocidade'
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: PokeApiService,
    private readonly seo: SeoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.seo.clearJsonLd('list');

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.errorMessage = 'Pokémon não encontrado.';
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }
      this.fetchPokemon(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetchPokemon(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const [pokemon, species] = await Promise.all([
        firstValueFrom(this.api.getPokemonDetails(id)),
        firstValueFrom(this.api.getPokemonSpecies(id))
      ]);

      this.pokemon = pokemon;
      this.species = species;
      const formattedName = this.formatName(pokemon.name);

      const image = this.api.getPokemonImage(pokemon);
      this.seo.applyTags(
        getSeoTags(SeoRoute.Detail, { name: formattedName, image, id: pokemon.id })
      );

      this.seo.setJsonLd('detail', {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: formattedName,
        description:
          this.description || `Detalhes, estatísticas e habilidades do Pokémon ${formattedName}.`,
        image: image || undefined,
        identifier: pokemon.id ? `#${pokemon.id}` : undefined,
        url: this.seo.resolveUrl(`/pokemon/${pokemon.id}`)
      });
    } catch {
      this.errorMessage =
        'Não foi possível carregar o Pokémon. Tente novamente mais tarde.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  get description(): string {
    if (!this.species) {
      return '';
    }
    const entry = this.species.flavor_text_entries.find(
      (item) => item.language.name === 'en'
    );
    return entry ? entry.flavor_text.replace(/\f|\n|\r/g, ' ') : '';
  }

  formatId(id: number): string {
    return String(id).padStart(4, '0');
  }

  formatName(name: string): string {
    return name
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  getWeight(weight: number): string {
    return `${(weight / 10).toFixed(1)} kg`;
  }

  getHeight(height: number): string {
    return `${(height / 10).toFixed(1)} m`;
  }

  statValue(stat: number): number {
    return Math.min(stat, 200);
  }

  get abilitiesText(): string {
    if (!this.pokemon) {
      return '';
    }
    return this.pokemon.abilities
      .map((ability) => this.formatName(ability.ability.name))
      .join(', ');
  }

  get imageUrl(): string | null {
    return this.pokemon ? this.api.getPokemonImage(this.pokemon) : null;
  }
}
