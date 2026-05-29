package models

import "time"

type Category struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Slug      string    `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}