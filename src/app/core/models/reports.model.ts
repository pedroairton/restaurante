export interface Report {
  average_ticket: number;
  daily_revenue?: number;
  period: {
    start_date: string;
    end_date: string;
  };
  sales_by_category: {
    id: number;
    name: string;
    total_revenue: string;
    total_quantity: string;
    percentage: string;
  }[];
  top_products: {
    id: number;
    name: string;
    category_name: string;
    total_sold: string;
    total_revenue: string;
  }[];
  total_orders: number;
  total_revenue: number;
}
