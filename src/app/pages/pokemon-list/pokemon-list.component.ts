import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../seo/seo.service';
import { getSeoTags } from '../../seo/seo-tags';
import { SeoRoute } from '../../seo/seo-routes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, takeUntil } from 'rxjs';
import { PokeApiService } from '../../services/poke-api.service';
import { NamedApiResource } from '../../models/pokemon';
import { TYPE_COLORS, TYPE_LABELS } from '../../utils/pokemon-types';

interface PokemonCard {
  id: number;
  name: string;
  image: string | null;
}

interface TypeOption {
  name: string;
  label: string;
}

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRippleModule
  ],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonListComponent implements OnInit, OnDestroy {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly typeControl = new FormControl<string[]>([], { nonNullable: true });

  types: TypeOption[] = [];
  pokemonCards: PokemonCard[] = [];
  totalCount = 0;
  pageIndex = 0;
  pageSize = 24;
  isLoading = true;
  isPageLoading = false;
  errorMessage = '';

  readonly typeLabels = TYPE_LABELS;
  readonly typeColors = TYPE_COLORS;

  private readonly destroy$ = new Subject<void>();
  private loadToken = 0;
  private readonly imageBaseUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  private readonly loadedImages = new Set<number>();

  constructor(
    private readonly api: PokeApiService,
    private readonly seo: SeoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.seo.applyTags(getSeoTags(SeoRoute.List));
    this.seo.clearJsonLd('detail');

    this.loadTypes();
    this.loadPage();

    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPage();
      });

    this.typeControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPage();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadTypes(): Promise<void> {
    try {
      const results = await firstValueFrom(this.api.getPokemonTypes());
      this.types = results.map((type) => ({
        name: type.name,
        label: this.typeLabels[type.name] ?? this.capitalize(type.name)
      }));
      this.cdr.markForCheck();
    } catch {
      this.errorMessage =
        'Não foi possível carregar os tipos agora. Tente novamente em instantes.';
      this.cdr.markForCheck();
    }
  }

  async loadPage(): Promise<void> {
    const currentToken = ++this.loadToken;
    this.errorMessage = '';
    this.isLoading = this.pokemonCards.length === 0;
    this.isPageLoading = this.pokemonCards.length > 0;
    this.cdr.markForCheck();

    try {
      const searchTerm = this.searchControl.value.trim().toLowerCase();
      const selectedTypes = this.typeControl.value;
      const sourceList = await this.fetchListByTypes(selectedTypes);

      if (currentToken !== this.loadToken) {
        return;
      }

      const filtered = searchTerm
        ? sourceList.filter((pokemon) => pokemon.name.includes(searchTerm))
        : sourceList;

      this.totalCount = filtered.length;
      const start = this.pageIndex * this.pageSize;
      const pageEntries = filtered.slice(start, start + this.pageSize);

      this.pokemonCards = pageEntries.map((entry, index) => {
        const id = this.extractId(entry, start + index + 1);
        return {
          id,
          name: entry.name,
          image: this.getImageUrl(id)
        };
      });
      this.updateListJsonLd(start);
    } catch {
      if (currentToken !== this.loadToken) {
        return;
      }
      this.errorMessage =
        'Não foi possível carregar a lista agora. Verifique sua conexão e tente novamente.';
    } finally {
      if (currentToken !== this.loadToken) {
        return;
      }
      this.isLoading = false;
      this.isPageLoading = false;
      this.cdr.markForCheck();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPage();
  }

  trackById(_: number, item: PokemonCard): number {
    return item.id;
  }

  formatId(id: number): string {
    return String(id).padStart(4, '0');
  }

  formatName(name: string): string {
    return this.capitalize(name);
  }

  get selectedTypes(): string[] {
    return this.typeControl.value;
  }

  typeSummary(): string {
    if (this.selectedTypes.length === 0) {
      return 'Todos os tipos';
    }
    return this.selectedTypes
      .map((type) => this.typeLabels[type] ?? this.capitalize(type))
      .join(', ');
  }

  isImageLoaded(id: number): boolean {
    return this.loadedImages.has(id);
  }

  markImageLoaded(id: number): void {
    if (!this.loadedImages.has(id)) {
      this.loadedImages.add(id);
      this.cdr.markForCheck();
    }
  }

  private capitalize(value: string): string {
    return value
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private extractId(resource: NamedApiResource, fallbackId: number): number {
    const match = resource.url.match(/\/pokemon\/(\d+)\/?$/);
    if (match) {
      return Number(match[1]);
    }
    return fallbackId;
  }

  private getImageUrl(id: number): string {
    return `${this.imageBaseUrl}/${id}.png`;
  }

  private async fetchListByTypes(types: string[]): Promise<NamedApiResource[]> {
    if (types.length === 0) {
      return firstValueFrom(this.api.getAllPokemonList());
    }
    if (types.length === 1) {
      return firstValueFrom(this.api.getPokemonListByType(types[0]));
    }

    const lists = await Promise.all(
      types.map((type) => firstValueFrom(this.api.getPokemonListByType(type)))
    );

    const sorted = lists.sort((a, b) => a.length - b.length);
    const [base, ...others] = sorted;
    const otherSets = others.map((list) => new Set(list.map((item) => item.name)));

    return base.filter((item) => otherSets.every((set) => set.has(item.name)));
  }

  private updateListJsonLd(startIndex: number): void {
    const itemListElement = this.pokemonCards.map((pokemon, index) => ({
      '@type': 'ListItem',
      position: startIndex + index + 1,
      name: this.formatName(pokemon.name),
      url: this.seo.resolveUrl(`/pokemon/${pokemon.id}`)
    }));

    this.seo.setJsonLd('list', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'RedeDor Pokédex - Lista de Pokémon',
      itemListOrder: 'http://schema.org/ItemListOrderAscending',
      numberOfItems: this.totalCount,
      itemListElement
    });
  }
}
