import { Product } from "./products.model";
import { Table } from "./tables.model";

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

export interface Order {
    id: number;
    table_id: number;
    status: string;
    observations: string | null;
    total: number;
    items: OrderItem[];
    table: Table;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product: Product;
    quantity: number;
    subtotal: string;
    unit_price: string;
    created_at: string;
    updated_at: string;
}