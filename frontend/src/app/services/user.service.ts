import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<{ userId: number; userName: string }>({ userId: 1, userName: 'Alice' });
  user$ = this.userSubject.asObservable();

  get userId() { return this.userSubject.value.userId; }
  get userName() { return this.userSubject.value.userName; }

  selectUser(userId: number, userName: string) {
    this.userSubject.next({ userId, userName });
  }
}
