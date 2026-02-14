import { APP_ID, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';
import { PokemonDetailComponent } from './pokemon-detail.component';
import { PokeApiService } from '../../services/poke-api.service';
import { PokemonDetail, PokemonSpecies } from '../../models/pokemon';

class MockPokeApiService {
  private detail: PokemonDetail = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    abilities: [{ ability: { name: 'overgrow', url: '' } }],
    types: [{ slot: 1, type: { name: 'grass', url: '' } }],
    stats: [{ base_stat: 45, stat: { name: 'hp', url: '' } }],
    sprites: {}
  };

  private species: PokemonSpecies = {
    flavor_text_entries: [
      {
        flavor_text: 'Seed Pokemon',
        language: { name: 'en' }
      }
    ]
  };

  getPokemonDetails = jasmine.createSpy().and.returnValue(of(this.detail));
  getPokemonSpecies = jasmine.createSpy().and.returnValue(of(this.species));
  getPokemonImage = jasmine
    .createSpy()
    .and.returnValue('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>');
}

describe('PokemonDetailComponent', () => {
  let fixture: ComponentFixture<PokemonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: PokeApiService, useClass: MockPokeApiService },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: { paramMap: convertToParamMap({ id: '1' }) }
          }
        },
        Title,
        Meta,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: APP_ID, useValue: 'server-app' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetailComponent);
  });

  it('renderiza detalhes do Pokémon', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bulbasaur');
    expect(compiled.textContent).toContain('Seed Pokemon');
    expect(compiled.textContent).toContain('HP');
  }));

  it('gera snapshot basico de SEO', fakeAsync(() => {
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const snapshot = {
      title: title.getTitle(),
      description: meta.getTag('name="description"')?.getAttribute('content'),
      ogTitle: meta.getTag('property="og:title"')?.getAttribute('content'),
      ogDescription: meta
        .getTag('property="og:description"')
        ?.getAttribute('content'),
      ogImage: meta.getTag('property="og:image"')?.getAttribute('content')
    };

    expect(snapshot).toEqual({
      title: 'RedeDor Pokédex | Bulbasaur',
      description: 'Detalhes, estatísticas e habilidades do Pokémon Bulbasaur.',
      ogTitle: 'RedeDor Pokédex | Bulbasaur',
      ogDescription: 'Confira o perfil completo do Pokémon Bulbasaur.',
      ogImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'
    });
  }));
});
