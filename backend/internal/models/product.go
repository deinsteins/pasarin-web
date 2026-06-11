package models

import "time"

type Product struct {
	ID          uint      `gorm:"primaryKey"`
	SellerID    uint      `gorm:"not null;index"`
	CategoryID  uint      `gorm:"not null;index"`
	Name        string    `gorm:"not null"`
	Slug        string    `gorm:"not null"`
	Description string    `gorm:"type:text"`
	Price       float64   `gorm:"not null"`
	Stock       int       `gorm:"not null;default:0"`
	Unit        string    `gorm:"not null"`
	ImageURL    string
	IsActive    bool      `gorm:"default:true"`
	IsAvailable bool      `gorm:"default:true"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Seller   Seller   `gorm:"foreignKey:SellerID"`
	Category Category `gorm:"foreignKey:CategoryID"`
}