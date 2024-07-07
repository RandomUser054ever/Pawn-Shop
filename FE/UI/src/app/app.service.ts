import { HttpClient } from "@angular/common/http";
import { PrismData } from "./components/auth_component/login/login_interfaces.ts/prismData";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) { }

  handleUserLoging(userCredentials: PrismData, endpoint: string) {

    return this.http.post<PrismData>(endpoint, {
      ...userCredentials
    }).subscribe({
      next(response: PrismData) {
          // TODO: Redirect to route if user is present in the database & in the meantime implement loading spinner https://material.angular.io/components/progress-spinner/overview
      }, error(err) {
          // TODO: If not alert something like "User not registered!" https://material.angular.io/components/snack-bar/overview
      },
    });
  }

}
