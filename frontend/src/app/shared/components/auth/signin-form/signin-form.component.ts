import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service'; 

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [AuthService],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (!this.email || !this.password) {
      console.warn('⚠️ Veuillez entrer un email et un mot de passe');
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password,
      rememberMe: this.isChecked
    };

    console.log('🔹 Tentative de connexion avec :', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie :', response);
        this.router.navigate(['/']); // redirection après succès
      },
      error: (error) => {
        console.error('❌ Erreur de connexion :', error);
        alert('Email ou mot de passe incorrect');
      }
    });
  }
}
