package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Phone     string    `gorm:"uniqueIndex"`
	Password  string    `gorm:"not null"`
	Role              string    `gorm:"default:customer;not null"`
	ResetToken        string
	ResetTokenExpires time.Time
	CreatedAt         time.Time `gorm:"autoCreateTime"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime"`
}