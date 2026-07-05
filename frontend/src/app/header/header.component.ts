import { Component, inject } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NzAvatarModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 24px;background:#001529;color:#fff">
      <span style="font-size:18px;font-weight:600;margin-right:auto">Sweedbank</span>
      <nz-avatar [nzText]="userService.userName.charAt(0)" nzSize="default" style="background:#1890ff;vertical-align:middle"></nz-avatar>
      <span>{{ userService.userName }}</span>
    </div>
  `,
})
export class HeaderComponent {
  readonly userService = inject(UserService);
}
