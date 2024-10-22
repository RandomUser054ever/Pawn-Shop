// UI\src\app\components\main_page_component\main-page\main-page.component.ts

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Products } from "./Interfaces/Products";
import { SeedDataService } from "./seedData/seed-data.service";
import { Router } from "@angular/router";
import { CartService } from "../../../services/cart.service";
import { SearchService } from "../../../services/search.service"; // Импортиране на SearchService
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.scss"]
})
export class MainPageComponent implements OnInit, OnDestroy {
  pageSize = 25;
  pageIndex = 0;
  totalProducts = 0;
  paginatedProducts: Products[] = [];

  public products: Products[];
  public filteredProducts: Products[];
  public categories: string[] = ["Electronics", "Clothes", "Jewelry", "Art", "Other"];
  public selectedCategory: string = "";
  public searchTerm: string = "";

  private subscriptions: Subscription = new Subscription(); // За управление на абонаментите

  constructor(
    private seedDataService: SeedDataService,
    private router: Router,
    private cartService: CartService,
    private searchService: SearchService // Инжектиране на SearchService
  ) {}

  ngOnInit(): void {
    this.products = this.seedDataService.products;
    this.filteredProducts = this.products;

    // Абониране за търсен термин
    const searchSub = this.searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term.toLowerCase();
      this.applyFilters();
    });
    this.subscriptions.add(searchSub);

    // Абониране за избрана категория
    const categorySub = this.searchService.selectedCategory$.subscribe(category => {
      this.selectedCategory = category;
      this.applyFilters();
    });
    this.subscriptions.add(categorySub);
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Отписване при унищожаване на компонента
  }

  goToDetails(id: number) {
    this.router.navigate(["/product", id]);
  }

  requestPurchase(product: Products) {
    this.cartService.addToCart(product);
  }

  applyFilters() {
    const filtered = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm) || product.model.toLowerCase().includes(this.searchTerm) || product.category.toLowerCase().includes(this.searchTerm);
      const matchesCategory = this.selectedCategory ? product.category === this.selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
    this.filteredProducts = filtered;
    this.totalProducts = filtered.length;
    this.paginateProducts();
  }

  paginateProducts() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginateProducts();
  }
}
