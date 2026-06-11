package ordernumber

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

// GenerateOrderNumber generates a unique, sequential order number in the format PSR-YYYYMMDD-000001
func GenerateOrderNumber(db *gorm.DB) (string, error) {
	today := time.Now().Format("20060102")
	prefix := fmt.Sprintf("PSR-%s-", today)

	var lastOrderNumbers []string
	err := db.Table("orders").
		Where("order_number LIKE ?", prefix+"%").
		Order("order_number DESC").
		Limit(1).
		Pluck("order_number", &lastOrderNumbers).Error
	if err != nil {
		return "", err
	}

	nextSeq := 1
	if len(lastOrderNumbers) > 0 {
		lastOrderNumber := lastOrderNumbers[0]
		parts := strings.Split(lastOrderNumber, "-")
		if len(parts) == 3 {
			seqStr := parts[2]
			seq, err := strconv.Atoi(seqStr)
			if err == nil {
				nextSeq = seq + 1
			}
		}
	}

	return fmt.Sprintf("%s%06d", prefix, nextSeq), nil
}
