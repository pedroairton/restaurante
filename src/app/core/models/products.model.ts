export interface Product {
    id: number;
    category_id: number;
    name: string;
    price: number;
    description: string;
    is_active: boolean;
    category: {
        id: number;
        name: string;
    }
}

export interface Category {
    id: number;
    name: string;
    products_count: number;
}