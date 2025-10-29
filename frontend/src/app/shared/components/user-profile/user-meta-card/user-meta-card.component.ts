import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-meta-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent implements OnInit {
  constructor(public modal: ModalService) {}

  isOpen = false;
  user: { _id?: string; username?: string; email?: string } | null = null;

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

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
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
