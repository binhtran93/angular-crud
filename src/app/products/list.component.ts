import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { ProductService } from '@app/_services';
import { Product } from '@app/_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    products!: Product[];

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getAll()
            .pipe(first())
            .subscribe(products => {
              console.log(products);
              this.products = products;
            });
    }

    deleteUser(id: string) {
        const user = this.products.find(x => x.id === id);
        if (!user) return;
        user.isDeleting = true;
        this.productService.delete(id)
            .pipe(first())
            .subscribe(() => this.products = this.products.filter(x => x.id !== id));
    }
}
