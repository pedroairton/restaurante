export interface Dashboard {
    monthly_revenue: number,
    monthly_orders: number,
    total_products: number,
    weekly_sales: WeeklySales[]
}
export interface WeeklySales {
    date: string,
    day_name: string,
    daily_total: number,
    daily_orders: number
}
export interface TopProducts {
    id: number,
    product_name: string,
    total_sold: string,
    total_revenue: string
}