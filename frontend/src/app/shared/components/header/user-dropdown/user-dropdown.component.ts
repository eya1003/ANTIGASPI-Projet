import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;
  User: { username?: string; email?: string; avatar?: string } | null = null;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.User = JSON.parse(storedUser); // transforme la string en objet
    }
  }
  closeDropdown() {
    this.isOpen = false;
  }
}