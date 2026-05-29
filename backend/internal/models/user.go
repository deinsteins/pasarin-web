package models

import "gorm.io/gorm"

type User struct {
	ID        uint           `gorm:"primaryKey"`
	Name      string         `gorm:"not null"`
	Email     string         `gorm:"uniqueIndex;not null"`
	Password  string         `gorm:"not null"`
	Role      string         `gorm:"default:customer;not null"`
	CreatedAt gorm.Time      `gorm:"autoCreateTime"`
	UpdatedAt gorm.Time      `gorm:"autoUpdateTime"`
}