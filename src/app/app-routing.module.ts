import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const productsModule = () => import('./products/products.module').then(x => x.ProductsModule);

const routes: Routes = [
    { path: '', loadChildren: productsModule },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
