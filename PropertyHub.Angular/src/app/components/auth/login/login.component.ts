import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastrModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <div class="text-center mb-4">
                  <h2 class="fw-bold text-primary mb-2">
                    <i class="fas fa-home me-2"></i>
                    PropertyHub
                  </h2>
                  <p class="text-muted">Sign in to your account</p>
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
                  <!-- Email -->
                  <div class="mb-3">
                    <label for="email" class="form-label">
                      <i class="fas fa-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                      formControlName="email"
                      placeholder="Enter your email"
                      required
                    >
                    <div class="invalid-feedback" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                      <div *ngIf="loginForm.get('email')?.hasError('required')">Email is required</div>
                      <div *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email address</div>
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="mb-3">
                    <label for="password" class="form-label">
                      <i class="fas fa-lock me-2"></i>Password
                    </label>
                    <div class="input-group">
                      <input
                        [type]="showPassword ? 'text' : 'password'"
                        id="password"
                        class="form-control"
                        [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                        formControlName="password"
                        placeholder="Enter your password"
                        required
                      >
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        (click)="togglePasswordVisibility()"
                      >
                        <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                      <div *ngIf="loginForm.get('password')?.hasError('required')">Password is required</div>
                      <div *ngIf="loginForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</div>
                    </div>
                  </div>

                  <!-- Remember Me & Forgot Password -->
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="rememberMe" formControlName="rememberMe">
                      <label class="form-check-label" for="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a href="#" class="text-decoration-none small">Forgot password?</a>
                  </div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i *ngIf="!isLoading" class="fas fa-sign-in-alt me-2"></i>
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                  </button>

                  <!-- Divider -->
                  <div class="text-center">
                    <div class="position-relative my-3">
                      <hr class="text-muted">
                      <span class="position-absolute top-0 start-50 translate-middle bg-white px-3 text-muted small">
                        Don't have an account?
                      </span>
                    </div>
                  </div>

                  <!-- Register Link -->
                  <div class="text-center">
                    <a routerLink="/register" class="btn btn-outline-primary w-100">
                      <i class="fas fa-user-plus me-2"></i>Create Account
                    </a>
                  </div>
                </form>
              </div>
            </div>

            <!-- Demo Credentials -->
            <div class="card mt-3 border-warning">
              <div class="card-body">
                <h6 class="card-title text-warning">
                  <i class="fas fa-info-circle me-2"></i>Demo Credentials
                </h6>
                <p class="card-text small mb-2">
                  <strong>Email:</strong> demo@propertyhub.com<br>
                  <strong>Password:</strong> demo123
                </p>
                <button class="btn btn-sm btn-outline-warning" (click)="fillDemoCredentials()">
                  <i class="fas fa-magic me-1"></i>Fill Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card {
      border-radius: 15px;
    }
    
    .btn-primary {
      background: linear-gradient(45deg, #667eea, #764ba2);
      border: none;
      border-radius: 10px;
      padding: 12px;
      font-weight: 600;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .form-control {
      border-radius: 10px;
      border: 2px solid #e9ecef;
      padding: 12px 15px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .input-group .btn {
      border-radius: 0 10px 10px 0;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'demo@propertyhub.com',
      password: 'demo123'
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.toastr.success('Login successful! Welcome back.', 'Success');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.toastr.error('Invalid email or password. Please try again.', 'Login Failed');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}