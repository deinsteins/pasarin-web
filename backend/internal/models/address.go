package models

import "time"

type Address struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint      `gorm:"not null;index" json:"user_id"`
	User           User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Label          string    `gorm:"not null" json:"label"`          // e.g. "Rumah", "Kantor"
	RecipientName  string    `gorm:"not null" json:"recipient_name"` 
	RecipientPhone string    `gorm:"not null" json:"recipient_phone"`
	Province       string    `gorm:"not null" json:"province"`
	City           string    `gorm:"not null" json:"city"`
	District       string    `gorm:"not null" json:"district"`
	PostalCode     string    `gorm:"not null" json:"postal_code"`
	Address        string    `gorm:"not null" json:"address"`
	IsDefault      bool      `gorm:"default:false" json:"is_default"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
