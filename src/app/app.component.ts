import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SeoService } from './seo/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  seoDebugEnabled = false;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seoDebugEnabled = this.seo.isDebugEnabled();
  }

  toggleSeoDebug(enabled: boolean): void {
    this.seo.setDebugEnabled(enabled);
    this.seoDebugEnabled = enabled;
  }
}
