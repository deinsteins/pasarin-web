package models

import "time"

type CartItem struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CartID    uint      `gorm:"not null;index" json:"cart_id"`
	Cart      Cart      `gorm:"foreignKey:CartID" json:"cart,omitempty"`
	ProductID uint      `gorm:"not null;index" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
