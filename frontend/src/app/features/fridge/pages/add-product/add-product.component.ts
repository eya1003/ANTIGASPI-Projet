import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { SelectComponent } from '../../../../shared/components/form/select/select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    RouterModule,
    SelectComponent,
    DatePickerComponent
  ],
  templateUrl: './add-product.component.html'
})
export class AddProductComponent {
  productForm: FormGroup;
  selectedFile: File | null = null;
  categories = [
    { label: 'Dairy', value: 'Dairy' },
    { label: 'Fruits', value: 'Fruits' },
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Meat', value: 'Meat' },
    { label: 'Other', value: 'Other' },
  ];

  constructor(private fb: FormBuilder, private productsService: ProductsService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      expiryDate: ['', Validators.required],
      image: ['']
    });
  }

  // gérer la sélection de catégorie
  handleSelectChange(value: string) {
    this.productForm.patchValue({ category: value });
  }

  // gérer le date picker
  handleDateChange(event: any) {
    if (!event) return;
    if (event.selectedDates && event.selectedDates.length > 0) {
      const date = event.selectedDates[0];
      this.productForm.patchValue({ expiryDate: date.toISOString() });
    } else {
      console.warn('Date invalide reçue du date picker', event);
    }
  }

  // sélectionner le fichier image
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  // soumission du formulaire
  handleSubmit() {
    if (!this.productForm.valid) {
      console.log('❌ Formulaire invalide');
      return;
    }

    // Récupérer l'id utilisateur depuis le localStorage
    const userString = localStorage.getItem('user');
    let userId = '';
    if (userString) {
      const userObj = JSON.parse(userString);
      userId = userObj._id; // juste l'ID
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('quantity', this.productForm.get('quantity')?.value);
    formData.append('category', this.productForm.get('category')?.value);
    formData.append('expiryDate', this.productForm.get('expiryDate')?.value);

    if (userId) formData.append('user', userId);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productsService.addProductWithImage(formData).subscribe({
      next: (res) => console.log('✅ Produit ajouté avec succès', res),
      error: (err) => console.error('❌ Erreur lors de l’ajout du produit', err)
    });
  }

}
