import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, HeaderComponent],
  template: `
    <nz-layout>
      <app-header />
      <nz-content style="padding:24px;max-width:960px;margin:0 auto;width:100%">
        <router-outlet />
      </nz-content>
    </nz-layout>
  `,
})
export class AppComponent {}
