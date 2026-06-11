package dto

type AdminDashboardResponse struct {
	TotalSellers    int64   `json:"total_sellers"`
	TotalCustomers  int64   `json:"total_customers"`
	TotalProducts   int64   `json:"total_products"`
	TotalOrders     int64   `json:"total_orders"`
	TodayOrders     int64   `json:"today_orders"`
	TodayRevenue    float64 `json:"today_revenue"`
	MonthlyRevenue  float64 `json:"monthly_revenue"`
}
