package dto

type CreateSellerRequest struct {
	UserID     uint   `json:"user_id" binding:"required"`
	StoreName  string `json:"store_name" binding:"required,min=1,max=100"`
	Phone      string `json:"phone" binding:"required"`
	Address    string `json:"address" binding:"required"`
	MarketName string `json:"market_name" binding:"required"`
}

type UpdateSellerRequest struct {
	StoreName  string `json:"store_name" binding:"required,min=1,max=100"`
	Phone      string `json:"phone" binding:"required"`
	Address    string `json:"address" binding:"required"`
	MarketName string `json:"market_name" binding:"required"`
	IsActive   *bool  `json:"is_active"`
}

type SellerResponse struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	StoreName  string `json:"store_name"`
	Phone      string `json:"phone"`
	Address    string `json:"address"`
	MarketName string `json:"market_name"`
	IsActive   bool   `json:"is_active"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type SellerDashboardResponse struct {
	TotalProducts  int64   `json:"total_products"`
	TotalOrders    int64   `json:"total_orders"`
	TodayOrders    int64   `json:"today_orders"`
	TodayRevenue   float64 `json:"today_revenue"`
	MonthlyRevenue float64 `json:"monthly_revenue"`
	LowStockCount  int64   `json:"low_stock_count"`
}