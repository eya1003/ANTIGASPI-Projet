import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
  providers: [AuthService, HttpClient],
  templateUrl: './user-info-card.component.html',
  styles: [``],
})
export class UserInfoCardComponent implements OnInit {
  isOpen = false;
  user: User | null = null;

  constructor(public modal: ModalService, private authService: AuthService) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) this.user = JSON.parse(storedUser);
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
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
        this.closeModal();
      },
      error: err => console.error(err),
    });
  }
}
