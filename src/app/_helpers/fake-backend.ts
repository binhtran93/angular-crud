import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { Role } from '@app/_models';

// array in local storage for registered users
const productsKey = 'angular-11-crud-example-users';
const productsJSON = localStorage.getItem(productsKey);
let products: any[] = productsJSON ? JSON.parse(productsJSON) : [{
    id: 1,
    name: 'Product One',
    price: 12,
}];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users') && method === 'GET':
                    return getProducts();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getProductById();
                case url.endsWith('/users') && method === 'POST':
                    return createProduct();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateProduct();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteProduct();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions

        function getProducts() {
          console.log(products)
            return ok(products.map(x => basicDetails(x)));
        }

        function getProductById() {
            const user = products.find(x => x.id === idFromUrl());
            return ok(basicDetails(user));
        }

        function createProduct() {
            const user = body;

            // assign user id and a few other properties then save
            user.id = newUserId();
            products.push(user);
            localStorage.setItem(productsKey, JSON.stringify(products));

            return ok();
        }

        function updateProduct() {
            let params = body;
            let product = products.find(x => x.id === idFromUrl());

            // update and save user
            Object.assign(product, params);
            localStorage.setItem(productsKey, JSON.stringify(products));

            return ok();
        }

        function deleteProduct() {
            products = products.filter(x => x.id !== idFromUrl());
            localStorage.setItem(productsKey, JSON.stringify(products));
            return ok();
        }

        // helper functions

        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message: any) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function basicDetails(user: any) {
            const { id, name, price } = user;
            return { id, name, price };
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newUserId() {
            return products.length ? Math.max(...products.map(x => x.id)) + 1 : 1;
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
