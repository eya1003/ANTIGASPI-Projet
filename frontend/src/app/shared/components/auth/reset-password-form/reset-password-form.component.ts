import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelComponent, InputFieldComponent, ButtonComponent],
  templateUrl: './reset-password-form.component.html',
})
export class ResetPasswordFormComponent {
  newPassword = '';
  confirmPassword = '';
  token: string | null = null;
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (!this.token) {
      this.error = 'Token manquant ou invalide';
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.error = '';
        // Redirection après succès
        setTimeout(() => this.router.navigate(['/signin']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la réinitialisation';
        this.message = '';
      },
    });
  }
}
