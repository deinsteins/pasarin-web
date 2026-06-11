package models

import "time"

type Payment struct {
	ID          uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID     uint       `gorm:"not null;index" json:"order_id"`
	Order       Order      `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Provider    string     `gorm:"not null" json:"provider"`
	ExternalID  string     `gorm:"index" json:"external_id"`
	PaymentURL  string     `json:"payment_url"`
	Amount      float64    `gorm:"not null" json:"amount"`
	Status      string     `gorm:"not null;default:pending" json:"status"`
	PaidAt      *time.Time `json:"paid_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
