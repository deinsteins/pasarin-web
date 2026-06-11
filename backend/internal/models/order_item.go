package models

import "time"

type OrderItem struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID      uint      `gorm:"not null;index" json:"order_id"`
	Order        Order     `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	ProductID    uint      `gorm:"not null;index" json:"product_id"`
	SellerID     uint      `gorm:"not null;index" json:"seller_id"`
	ProductName  string    `gorm:"not null" json:"product_name"`
	ProductPrice float64   `gorm:"not null" json:"product_price"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Subtotal     float64   `gorm:"not null" json:"subtotal"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
