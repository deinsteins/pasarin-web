package models

import "time"

// ProductPriceHistory tracks every price change for a product.
type ProductPriceHistory struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID uint      `gorm:"not null;index" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	OldPrice  float64   `gorm:"not null;type:numeric(10,2)" json:"old_price"`
	NewPrice  float64   `gorm:"not null;type:numeric(10,2)" json:"new_price"`
	ChangedBy uint      `gorm:"not null;index" json:"changed_by"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
