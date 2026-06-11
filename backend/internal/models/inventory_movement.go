package models

import "time"

// InventoryMovement tracks every stock change for a product.
// Type values: stock_in | stock_out | adjustment | order
type InventoryMovement struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID      uint      `gorm:"not null;index" json:"product_id"`
	Product        Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Type           string    `gorm:"not null" json:"type"` // stock_in, stock_out, adjustment, order
	QuantityBefore int       `gorm:"not null" json:"quantity_before"`
	QuantityChange int       `gorm:"not null" json:"quantity_change"` // positive = in, negative = out
	QuantityAfter  int       `gorm:"not null" json:"quantity_after"`
	Notes          string    `json:"notes"`
	CreatedBy      uint      `gorm:"not null;index" json:"created_by"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
}
