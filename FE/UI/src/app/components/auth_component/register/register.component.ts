import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../app.service";
import { NotificationService } from "../../../shared/services/notification.service";
import { faUser, faLock, faEnvelope, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent {
  registerForm: FormGroup;
  faUser = faUser;
  faLock = faLock;
  faEnvelope = faEnvelope;
  faIdCard = faIdCard;
  registerError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private notificationService: NotificationService) {
    this.registerForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$")]],
      confirmPassword: ["", [Validators.required]],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]]
    });
  }

  onSubmit() {
    console.log("RegisterComponent: Form submitted");
    if (this.registerForm.valid) {
      const registerData = {
        email: this.registerForm.get("email")?.value,
        password: this.registerForm.get("password")?.value,
        confirmPassword: this.registerForm.get("confirmPassword")?.value,
        firstName: this.registerForm.get("firstName")?.value,
        lastName: this.registerForm.get("lastName")?.value
      };

      this.authService.handlerUserRegister(registerData, `${environment.host}/api/auth/register`).subscribe({
        next: () => {
          console.log("RegisterComponent: Registration successful");
          this.notificationService.showSuccess("Registration successful! Please check your email to verify your account.");
          this.router.navigate(["/login"]);
        },
        error: error => {
          console.error("RegisterComponent: Registration error", error);
          this.registerError = error.error?.message || "Registration failed";
          this.notificationService.showError(this.registerError || "An error occurred");
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(["/login"]);
  }
}
