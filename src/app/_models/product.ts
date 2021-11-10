import { Role } from './role';

export class Product {
    id!: string;
    name!: string;
    price!: number;
    isDeleting: boolean = false;
}
