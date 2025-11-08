import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    imports: [CommonModule],
})
export class VerifyComponent implements OnInit {
    message = 'Vérification en cours...';
    isError = false;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.message = 'Token manquant.';
            this.isError = true;
            return;
        }

        this.authService.verifyEmail(token).subscribe({
            next: (res) => {
                this.message = '✅ Votre compte a été vérifié avec succès !';
                setTimeout(() => this.router.navigate(['/signin']), 2000);
            },
            error: (err) => {
                this.isError = true;
                this.message = err.error?.message || '❌ Échec de la vérification.';
            },
        });
    }
}
