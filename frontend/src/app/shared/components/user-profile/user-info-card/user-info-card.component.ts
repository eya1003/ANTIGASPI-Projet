import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``,
})
export class UserInfoCardComponent implements OnInit {
  constructor(public modal: ModalService) {}

  isOpen = false;
  user: { username: string; email: string } | null = null;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      console.log('✅ Utilisateur chargé depuis localStorage :', this.user);
    } else {
      console.warn('⚠️ Aucun utilisateur trouvé dans le localStorage');
    }
  }

  handleSave() {
    console.log('💾 Saving changes...');
    this.modal.closeModal();
  }
}
