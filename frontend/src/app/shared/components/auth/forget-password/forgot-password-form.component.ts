import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputFieldComponent, LabelComponent],
  templateUrl: './forgot-password-form.component.html',
  styles: ``,
})
export class ForgotPasswordFormComponent {
  email = '';
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) {
      this.error = 'Veuillez saisir votre email';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la demande';
        this.message = '';
      },
    });
  }
}
