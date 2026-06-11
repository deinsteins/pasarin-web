package service

import (
	"errors"
	"fmt"

	"github.com/deinsteins/pasarin-web/backend/internal/checkout/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/pkg/ordernumber"
	"gorm.io/gorm"
)

type CheckoutService struct {
	db *database.Database
}

func NewCheckoutService(db *database.Database) *CheckoutService {
	return &CheckoutService{db: db}
}

func (s *CheckoutService) Checkout(userID uint, req dto.CheckoutRequest) (*dto.CheckoutResponse, error) {
	var orderID uint
	var orderNum string

	err := s.db.DB().Transaction(func(tx *gorm.DB) error {
		// 1. Get user's cart
		var cart models.Cart
		if err := tx.Where("user_id = ?", userID).First(&cart).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("cart is empty")
			}
			return err
		}

		// 2. Get cart items
		var cartItems []models.CartItem
		if err := tx.Preload("Product").Where("cart_id = ?", cart.ID).Find(&cartItems).Error; err != nil {
			return err
		}

		if len(cartItems) == 0 {
			return errors.New("cart is empty")
		}

		// 3. Validate address
		var address models.Address
		if err := tx.Where("id = ? AND user_id = ?", req.AddressID, userID).First(&address).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("address not found or unauthorized")
			}
			return err
		}

		// 4. Calculate subtotal and validate stock
		var subtotal float64 = 0.0
		for _, item := range cartItems {
			if item.Quantity <= 0 {
				return errors.New("invalid quantity in cart")
			}
			if item.Quantity > item.Product.Stock {
				return fmt.Errorf("insufficient stock for product: %s", item.Product.Name)
			}
			subtotal += float64(item.Quantity) * item.Product.Price
		}

		// Delivery fee defaults to 10000.0
		deliveryFee := 10000.0
		totalAmount := subtotal + deliveryFee

		// 5. Generate Order Number
		orderNumber, err := ordernumber.GenerateOrderNumber(tx)
		if err != nil {
			return err
		}

		// 6. Create Order record
		order := models.Order{
			OrderNumber:  orderNumber,
			UserID:       userID,
			AddressID:    req.AddressID,
			Status:       "pending",
			Subtotal:     subtotal,
			DeliveryFee:  deliveryFee,
			TotalAmount:  totalAmount,
			Notes:        req.Notes,
		}
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// 7. Create OrderItem records and decrement product stock
		for _, item := range cartItems {
			// Decrement product stock
			newStock := item.Product.Stock - item.Quantity
			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).Update("stock", newStock).Error; err != nil {
				return err
			}

			// Create OrderItem snapshot
			orderItem := models.OrderItem{
				OrderID:      order.ID,
				ProductID:    item.ProductID,
				SellerID:     item.Product.SellerID,
				ProductName:  item.Product.Name,
				ProductPrice: item.Product.Price,
				Quantity:     item.Quantity,
				Subtotal:     float64(item.Quantity) * item.Product.Price,
			}
			if err := tx.Create(&orderItem).Error; err != nil {
				return err
			}
		}

		// 8. Clear cart items
		if err := tx.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}

		orderID = order.ID
		orderNum = order.OrderNumber
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &dto.CheckoutResponse{
		OrderID:     orderID,
		OrderNumber: orderNum,
	}, nil
}
