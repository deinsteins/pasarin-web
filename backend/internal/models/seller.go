package models

import "time"

type Seller struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"not null;index"`
	StoreName  string    `gorm:"not null"`
	Phone      string    `gorm:"not null"`
	Address    string    `gorm:"not null"`
	MarketName string    `gorm:"not null"`
	IsActive   bool      `gorm:"default:true"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`

	User User `gorm:"foreignKey:UserID"`
}