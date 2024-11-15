// UI\src\app\components\my_account_component\my-account\my-account.component.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MyAccountComponent } from "./my-account.component";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../../app.service";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NoopAnimationsModule } from "@angular/platform-browser/animations"; // Добавен импорт
import { NotificationService } from "../../../shared/services/notification.service"; // Добавен импорт

// Mock for AuthService
class MockAuthService {
  verifyPassword(currentPassword: string) {
    if (currentPassword === "correct_password") {
      return of(true);
    } else if (currentPassword === "error_password") {
      return throwError(() => new Error("Error verifying password"));
    } else if (currentPassword === "wrong_password") {
      // Добавено
      return throwError(() => ({
        status: 400,
        error: { message: "Incorrect current password" }
      }));
    } else {
      return of(false);
    }
  }

  getCurrentUser() {
    return {
      id: 1,
      loginUsername: "testuser",
      isAdmin: false,
      isEmployee: false,
      role: "user"
    };
  }

  // Коригирана функция updateUserAccount
  updateUserAccount(data: any) {
    console.log("MockAuthService: updateUserAccount called with", data);
    if (data.currentPassword === "error_password") {
      return throwError(() => ({
        status: 400,
        error: { message: "Error verifying password" }
      }));
    }
    if (data.currentPassword === "wrong_password") {
      // Добавено
      return throwError(() => ({
        status: 400,
        error: { message: "Incorrect current password" }
      }));
    }
    return of("Success"); // Връща стринг, съобразно responseType: 'text'
  }

  // Добавен метод logout
  logout() {
    // Добавено
    console.log("MockAuthService: logout called");
    return of(true);
  }
}

// Mock for Router
class MockRouter {
  navigate = jasmine.createSpy("navigate");
}

// Mock for NotificationService
class MockNotificationService {
  showSuccess = jasmine.createSpy("showSuccess");
  showError = jasmine.createSpy("showError");
  showInfo = jasmine.createSpy("showInfo");
}

describe("MyAccountComponent", () => {
  let component: MyAccountComponent;
  let fixture: ComponentFixture<MyAccountComponent>;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;
  let mockNotificationService: MockNotificationService; // Добавена променлива
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();
    mockNotificationService = new MockNotificationService(); // Инициализиране на MockNotificationService
    formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      declarations: [MyAccountComponent],
      imports: [ReactiveFormsModule, FontAwesomeModule, NoopAnimationsModule], // Добавен NoopAnimationsModule
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService }, // Добавен MockNotificationService
        FormBuilder
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test for component creation
  it("should create MyAccountComponent", () => {
    expect(component).toBeTruthy();
  });

  // Test for form initialization
  it("should initialize the form correctly", () => {
    expect(component.myAccountForm).toBeDefined();
    const formValues = {
      username: "",
      email: "testuser", // Променено от '' на 'testuser'
      shopAddress: "",
      currentPassword: ""
    };
    expect(component.myAccountForm.value).toEqual(formValues);
  });

  // Test for form validity when required fields are empty
  it("should be invalid if required fields are empty", () => {
    component.myAccountForm.controls["username"].setValue("");
    component.myAccountForm.controls["email"].setValue("");
    component.myAccountForm.controls["shopAddress"].setValue("");
    component.myAccountForm.controls["currentPassword"].setValue("");
    expect(component.myAccountForm.invalid).toBeTrue();
  });

  // Test for form validity with valid inputs
  it("should be valid if all fields are filled correctly", () => {
    component.myAccountForm.controls["username"].setValue("testuser");
    component.myAccountForm.controls["email"].setValue("test@example.com");
    component.myAccountForm.controls["shopAddress"].setValue("123 Main St");
    component.myAccountForm.controls["currentPassword"].setValue("correct_password");
    expect(component.myAccountForm.valid).toBeTrue();
  });

  // Test to call verifyPassword on form submit with valid data
  it("should call verifyPassword on submitting a valid form", fakeAsync(() => {
    const spy = spyOn(mockAuthService, "verifyPassword").and.callThrough();

    component.myAccountForm.controls["username"].setValue("testuser");
    component.myAccountForm.controls["email"].setValue("test@example.com");
    component.myAccountForm.controls["shopAddress"].setValue("123 Main St");
    component.myAccountForm.controls["currentPassword"].setValue("correct_password");

    component.onSubmit();
    tick(2000); // Увеличен тик за setTimeout в handleSuccessfulUpdate

    expect(spy).toHaveBeenCalledWith("correct_password");
    expect(component.errorMessage).toBe("");
  }));

  // Test for successful data update with correct password
  it("should show success message on correct password", fakeAsync(() => {
    // Спаяйте методите на NotificationService вместо window.alert
    expect(mockNotificationService.showSuccess).not.toHaveBeenCalled();

    component.myAccountForm.controls["username"].setValue("testuser");
    component.myAccountForm.controls["email"].setValue("testuser"); // Променено да съвпада с loginUsername
    component.myAccountForm.controls["shopAddress"].setValue("123 Main St");
    component.myAccountForm.controls["currentPassword"].setValue("correct_password");

    component.onSubmit();
    tick(2000); // Увеличен тик за setTimeout в handleSuccessfulUpdate

    expect(component.errorMessage).toBe("");
    expect(mockNotificationService.showSuccess).toHaveBeenCalledWith("Successfully updated credentials");
    expect(mockAuthService.logout).toHaveBeenCalled(); // Добавено
  }));

  // Test for showing error on incorrect current password
  it("should show error on incorrect current password", fakeAsync(() => {
    component.myAccountForm.controls["username"].setValue("testuser");
    component.myAccountForm.controls["email"].setValue("test@example.com");
    component.myAccountForm.controls["shopAddress"].setValue("123 Main St");
    component.myAccountForm.controls["currentPassword"].setValue("wrong_password");

    component.onSubmit();
    tick(); // Handle immediate error

    expect(component.errorMessage).toBe("Incorrect current password");
    expect(mockNotificationService.showError).toHaveBeenCalledWith("Incorrect current password");
  }));

  // Test for showing error on verifyPassword error
  it("should show error on verifyPassword error", fakeAsync(() => {
    component.myAccountForm.controls["username"].setValue("testuser");
    component.myAccountForm.controls["email"].setValue("test@example.com");
    component.myAccountForm.controls["shopAddress"].setValue("123 Main St");
    component.myAccountForm.controls["currentPassword"].setValue("error_password");

    component.onSubmit();
    tick(); // Handle immediate error

    expect(component.errorMessage).toBe("Error verifying password");
    expect(mockNotificationService.showError).toHaveBeenCalledWith("Error verifying password");
  }));

  // Test for navigation to password change page
  it("should navigate to change password page on onChangePassword", () => {
    component.onChangePassword();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/my-account/change-password"]);
  });

  // Test for FontAwesome icon availability
  it("should have faUser icon", () => {
    expect(component.faUser).toBeDefined();
  });
});
