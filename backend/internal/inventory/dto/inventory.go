package dto

// StockAdjustmentRequest is the request body for POST /api/seller/products/:id/stock
type StockAdjustmentRequest struct {
	Type     string `json:"type"`     // stock_in | stock_out | adjustment
	Quantity int    `json:"quantity"` // always positive; direction derived from Type
	Notes    string `json:"notes"`
}

// StockAdjustmentResponse is returned after a successful adjustment
type StockAdjustmentResponse struct {
	ProductID      uint   `json:"product_id"`
	Type           string `json:"type"`
	QuantityBefore int   `json:"quantity_before"`
	QuantityChange int   `json:"quantity_change"`
	QuantityAfter  int   `json:"quantity_after"`
	Notes          string `json:"notes"`
	CreatedAt      string `json:"created_at"`
}

type PaginationMeta struct {
	Page     int   `json:"page"`
	Limit    int   `json:"limit"`
	Total    int64 `json:"total"`
	LastPage int64 `json:"last_page"`
}

type StockHistoryItemResponse struct {
	ID             uint   `json:"id"`
	ProductID      uint   `json:"product_id"`
	Type           string `json:"type"`
	QuantityBefore int    `json:"quantity_before"`
	QuantityChange int    `json:"quantity_change"`
	QuantityAfter  int    `json:"quantity_after"`
	Notes          string `json:"notes"`
	CreatedBy      uint   `json:"created_by"`
	CreatedAt      string `json:"created_at"`
}

type PaginatedStockHistoryResponse struct {
	Data []StockHistoryItemResponse `json:"data"`
	Meta PaginationMeta             `json:"meta"`
}

