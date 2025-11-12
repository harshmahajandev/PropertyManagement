import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <div class="text-center mb-4">
                  <h2 class="fw-bold text-primary mb-2">
                    <i class="fas fa-home me-2"></i>
                    PropertyHub
                  </h2>
                  <p class="text-muted">Create your account in 60 seconds</p>
                </div>

                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
                  <div class="row">
                    <!-- Full Name -->
                    <div class="col-md-6 mb-3">
                      <label for="fullName" class="form-label">
                        <i class="fas fa-user me-2"></i>Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        class="form-control"
                        [class.is-invalid]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
                        formControlName="fullName"
                        placeholder="John Doe"
                        required
                      >
                      <div class="invalid-feedback" *ngIf="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched">
                        <div *ngIf="registerForm.get('fullName')?.hasError('required')">Full name is required</div>
                        <div *ngIf="registerForm.get('fullName')?.hasError('minlength')">Name must be at least 2 characters</div>
                      </div>
                    </div>

                    <!-- Email -->
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">
                        <i class="fas fa-envelope me-2"></i>Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        class="form-control"
                        [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                        formControlName="email"
                        placeholder="john@example.com"
                        required
                      >
                      <div class="invalid-feedback" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                        <div *ngIf="registerForm.get('email')?.hasError('required')">Email is required</div>
                        <div *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address</div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <!-- Phone -->
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">
                        <i class="fas fa-phone me-2"></i>Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        class="form-control"
                        formControlName="phone"
                        placeholder="+1 (555) 123-4567"
                      >
                    </div>

                    <!-- Nationality -->
                    <div class="col-md-6 mb-3">
                      <label for="nationality" class="form-label">
                        <i class="fas fa-globe me-2"></i>Nationality (Optional)
                      </label>
                      <select id="nationality" class="form-select" formControlName="nationality">
                        <option value="">Select your nationality</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="SG">Singapore</option>
                        <option value="JP">Japan</option>
                        <option value="Other">Other</option>
                      </select>
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
                        [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                        formControlName="password"
                        placeholder="Create a strong password"
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
                    <div class="invalid-feedback" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                      <div *ngIf="registerForm.get('password')?.hasError('required')">Password is required</div>
                      <div *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 8 characters</div>
                      <div *ngIf="registerForm.get('password')?.hasError('pattern')">Password must contain at least one uppercase, lowercase, number, and special character</div>
                    </div>
                    
                    <!-- Password Strength Indicator -->
                    <div class="mt-2">
                      <div class="progress" style="height: 4px;">
                        <div
                          class="progress-bar"
                          [class]="getPasswordStrengthClass()"
                          [style.width.%]="getPasswordStrengthWidth()"
                          role="progressbar"
                        ></div>
                      </div>
                      <small class="text-muted">Password strength: {{ getPasswordStrengthText() }}</small>
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">
                      <i class="fas fa-lock me-2"></i>Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      class="form-control"
                      [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                      formControlName="confirmPassword"
                      placeholder="Confirm your password"
                      required
                    >
                    <div class="invalid-feedback" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                      <div *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm your password</div>
                      <div *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</div>
                    </div>
                  </div>

                  <!-- Terms and Conditions -->
                  <div class="mb-4">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="agreeTerms" 
                        formControlName="agreeTerms"
                        [class.is-invalid]="registerForm.get('agreeTerms')?.invalid && registerForm.get('agreeTerms')?.touched"
                      >
                      <label class="form-check-label" for="agreeTerms">
                        I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
                      </label>
                      <div class="invalid-feedback" *ngIf="registerForm.get('agreeTerms')?.invalid && registerForm.get('agreeTerms')?.touched">
                        You must agree to the terms and conditions
                      </div>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="registerForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i *ngIf="!isLoading" class="fas fa-user-plus me-2"></i>
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  </button>

                  <!-- Login Link -->
                  <div class="text-center">
                    <p class="text-muted mb-0">
                      Already have an account? 
                      <a routerLink="/login" class="text-decoration-none fw-bold">Sign in here</a>
                    </p>
                  </div>
                </form>
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
    
    .form-control, .form-select {
      border-radius: 10px;
      border: 2px solid #e9ecef;
      padding: 12px 15px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .input-group .btn {
      border-radius: 0 10px 10px 0;
    }
    
    .progress {
      border-radius: 10px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      nationality: [''],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9@$!%*?&]/.test(password)) score += 25;
    
    return score;
  }

  getPasswordStrengthWidth(): number {
    return this.getPasswordStrength();
  }

  getPasswordStrengthClass(): string {
    const score = this.getPasswordStrength();
    if (score <= 25) return 'bg-danger';
    if (score <= 50) return 'bg-warning';
    if (score <= 75) return 'bg-info';
    return 'bg-success';
  }

  getPasswordStrengthText(): string {
    const score = this.getPasswordStrength();
    if (score <= 25) return 'Weak';
    if (score <= 50) return 'Fair';
    if (score <= 75) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const userData = {
        fullName: this.registerForm.value.fullName,
        email: this.registerForm.value.email,
        phone: this.registerForm.value.phone,
        nationality: this.registerForm.value.nationality,
        password: this.registerForm.value.password
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.toastr.success('Account created successfully! Welcome to PropertyHub.', 'Registration Successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.toastr.error('Registration failed. Please try again.', 'Registration Failed');
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
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}