import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
  ],
  templateUrl: './signup-form.component.html',
})
export class SignupFormComponent {
  username = '';
  email = '';
  password = '';
  showPassword = false;
  isChecked = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    if (!this.username || !this.email || !this.password) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newUser: User = {
      username: this.username,
      email: this.email,
    };

    this.authService.signup({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (user) => {
        console.log('✅ Inscription réussie :', user);
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’inscription :', err);
        alert(err.error?.message || 'Une erreur est survenue');
      }
    });
  }
}
