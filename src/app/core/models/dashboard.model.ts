export interface Dashboard {
    monthly_revenue: number,
    monthly_orders: number,
    total_products: number,
    weekly_sales: WeeklySales[]
}
export interface WeeklySales {
    date: string,
    day_name: string,
    total_products: number,
    daily_orders: number
}