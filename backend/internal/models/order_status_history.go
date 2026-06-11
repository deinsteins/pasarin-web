package models

import "time"

type OrderStatusHistory struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   uint      `gorm:"not null;index" json:"order_id"`
	Order     Order     `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	FromStatus string   `gorm:"not null" json:"from_status"`
	ToStatus   string   `gorm:"not null" json:"to_status"`
	ChangedBy *uint     `gorm:"index" json:"changed_by"` // nil = system (e.g. webhook)
	CreatedAt time.Time `json:"created_at"`
}
