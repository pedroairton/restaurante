export interface Product {
    id: number;
    category_id: number;
    name: string;
    price: number;
    description: string;
    is_active: boolean;
    category?: {
        id: number;
        name: string;
    }
}

export interface Category {
    id: number;
    name: string;
    products_count: number;
}

export interface SalesStats {
    weeklySales: {
        week: number;
        week_start: string;
        total_sold: number | string;
        total_revenue: number | string;
    }[],
    monthlySales: {
        year: number;
        month: number;
        total_sold: number | string;
        total_revenue: number | string;
    }[],
    totals: {
        total_sold: number | string;
        total_revenue: number | string;
    }
}