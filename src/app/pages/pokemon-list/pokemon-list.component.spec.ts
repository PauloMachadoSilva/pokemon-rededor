import { APP_ID, PLATFORM_ID } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flush
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { PokemonListComponent } from './pokemon-list.component';
import { PokeApiService } from '../../services/poke-api.service';
class MockPokeApiService {
  getPokemonTypes = jasmine
    .createSpy()
    .and.returnValue(of([{ name: 'grass', url: '' }]));
  getPokemonListByType = jasmine
    .createSpy()
    .and.returnValue(
      of([{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }])
    );
}

describe('PokemonListComponent', () => {
  let fixture: ComponentFixture<PokemonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonListComponent, NoopAnimationsModule],
      providers: [
        { provide: PokeApiService, useClass: MockPokeApiService },
        provideRouter([]),
        Title,
        Meta,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: APP_ID, useValue: 'server-app' },
        { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renderiza cards de Pokémon', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.pokemon-card');

    expect(cards.length).toBe(1);
    expect(compiled.textContent).toContain('Bulbasaur');
    flush();
    discardPeriodicTasks();
  }));

  it('gera snapshot basico de SEO', fakeAsync(() => {
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);

    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    const snapshot = {
      title: title.getTitle(),
      description: meta.getTag('name="description"')?.getAttribute('content'),
      ogTitle: meta.getTag('property="og:title"')?.getAttribute('content'),
      ogDescription: meta
        .getTag('property="og:description"')
        ?.getAttribute('content')
    };

    expect(snapshot).toEqual({
      title: 'RedeDor Pokédex | Lista de Pokémon',
      description:
        'Explore uma Pokédex moderna com filtros por nome e tipo, paginação inteligente e detalhes completos.',
      ogTitle: 'RedeDor Pokédex | Lista de Pokémon',
      ogDescription: 'Lista responsiva com filtros e paginação para explorar a PokéAPI.'
    });
    flush();
    discardPeriodicTasks();
  }));
});
