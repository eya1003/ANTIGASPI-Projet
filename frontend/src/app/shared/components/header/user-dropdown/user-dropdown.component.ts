import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DropdownComponent,
    DropdownItemTwoComponent,
    HttpClientModule,
  ],
  templateUrl: './user-dropdown.component.html',
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  user$!: Observable<User | null>; // ✅ observable directement

  constructor(private authService: AuthService) {
    this.authService.loadUserFromStorage();
  }

  ngOnInit(): void {
    // On récupère directement l’observable depuis le service
    this.user$ = this.authService.currentUser$;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
