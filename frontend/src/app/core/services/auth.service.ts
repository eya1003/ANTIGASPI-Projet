import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id?: string;
  username?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) { }
  private apiUrl = `${environment.apiUrl}/users`;

  // BehaviorSubject pour stocker l'utilisateur courant
  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  loadUserFromStorage() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.currentUserSubject.next(user);
  }
  forgotPassword(email: string) {
  return this.http.post(`${this.apiUrl}/forgot-password`, { email });
}


  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response) {
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUserSubject.next(response); // met à jour l'observable
        }
      })
    );
  }

  updateUser(id: string, updateData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, updateData).pipe(
      tap(updatedUser => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser); // ✅ update direct
      })
    );
  }
  signup(data: { username: string; email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, data).pipe(
      tap((newUser) => {
        // Sauvegarde dans le localStorage si besoin
        //localStorage.setItem('user', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);
        console.log('✅ Nouvel utilisateur enregistré :', newUser);
      })
    );
  }

  resetPassword(token: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
}


  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify?token=${token}`);
  }


  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
