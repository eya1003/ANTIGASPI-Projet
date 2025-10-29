import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ModalService } from '../../../services/modal.service';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-info-card.component.html',
  providers: [AuthService, HttpClient],
  styles: [``],
})
export class UserInfoCardComponent implements OnInit {
  isOpen = false;
  user: User | null = null;

  constructor(public modal: ModalService, private authService: AuthService) {}

  ngOnInit(): void {
    // On s'abonne à l'utilisateur courant pour récupérer les mises à jour
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  handleSave() {
  if (!this.user?._id) return;

  this.authService.updateUser(this.user._id, {
    username: this.user.username,
    email: this.user.email,
  }).subscribe({
    next: updatedUser => {
      this.user = updatedUser; // met à jour la carte
      this.closeModal();
      // Le service met automatiquement à jour le BehaviorSubject,
      // donc tous les composants abonnés seront notifiés
    },
    error: err => console.error(err),
  });
}

}
