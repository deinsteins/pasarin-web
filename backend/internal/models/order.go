package models

import "time"

type Order struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNumber  string    `gorm:"uniqueIndex;not null" json:"order_number"`
	UserID       uint      `gorm:"not null;index" json:"user_id"`
	User         User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	AddressID    uint      `gorm:"not null;index" json:"address_id"`
	Address      Address   `gorm:"foreignKey:AddressID" json:"address,omitempty"`
	Status       string    `gorm:"not null;default:pending" json:"status"` // pending, paid, confirmed, packed, delivered, cancelled
	Subtotal     float64   `gorm:"not null" json:"subtotal"`
	DeliveryFee  float64   `gorm:"not null" json:"delivery_fee"`
	TotalAmount  float64   `gorm:"not null" json:"total_amount"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	OrderItems   []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
}
