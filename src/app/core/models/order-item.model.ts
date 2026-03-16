import { Product } from "./products.model";

export interface SelectedItem {
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface CreateOrderPayload {
    table_id: number;
    observations: string | null;
    items: {
        product_id: number;
        quantity: number;
    }[];
}