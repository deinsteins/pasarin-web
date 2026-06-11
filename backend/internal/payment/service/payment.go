package service

import (
	"errors"
	"time"

	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	orderRepository "github.com/deinsteins/pasarin-web/backend/internal/order/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/payment"
	"github.com/deinsteins/pasarin-web/backend/internal/payment/dto"
	paymentRepository "github.com/deinsteins/pasarin-web/backend/internal/payment/repository"
	"gorm.io/gorm"
)

type PaymentService struct {
	db          *database.Database
	orderRepo   *orderRepository.OrderRepository
	paymentRepo *paymentRepository.PaymentRepository
	provider    payment.PaymentProvider
}

func NewPaymentService(
	db *database.Database,
	orderRepo *orderRepository.OrderRepository,
	paymentRepo *paymentRepository.PaymentRepository,
	provider payment.PaymentProvider,
) *PaymentService {
	return &PaymentService{
		db:          db,
		orderRepo:   orderRepo,
		paymentRepo: paymentRepo,
		provider:    provider,
	}
}

func (s *PaymentService) PayOrder(userID uint, orderID uint) (*dto.PaymentResponse, error) {
	// 1. Fetch order and verify ownership
	order, err := s.orderRepo.GetOrderByIDAndUserID(orderID, userID)
	if err != nil {
		return nil, err // Will return gorm.ErrRecordNotFound if not owned or doesn't exist
	}

	// 2. Validate order status
	if order.Status != "pending" {
		return nil, errors.New("order status must be pending")
	}

	// 3. Create payment link via provider
	linkResp, err := s.provider.CreatePaymentLink(*order)
	if err != nil {
		return nil, err
	}

	// 4. Save payment record
	paymentModel := &models.Payment{
		OrderID:    order.ID,
		Provider:   "mayar",
		ExternalID: linkResp.ExternalID,
		PaymentURL: linkResp.PaymentURL,
		Amount:     order.TotalAmount,
		Status:     "pending",
	}

	if err := s.paymentRepo.CreatePayment(paymentModel); err != nil {
		return nil, err
	}

	// 5. Return payment details
	return &dto.PaymentResponse{
		PaymentID:  paymentModel.ID,
		PaymentURL: paymentModel.PaymentURL,
	}, nil
}

func (s *PaymentService) ProcessMayarWebhook(externalID string, mayarStatus string) error {
	var paymentStatus string
	var orderStatus string

	switch mayarStatus {
	case "success":
		paymentStatus = "paid"
		orderStatus = "paid"
	case "expired":
		paymentStatus = "expired"
		orderStatus = "expired"
	case "failed":
		paymentStatus = "failed"
		orderStatus = "failed"
	default:
		// If status is not one of the mapped ones, ignore
		return nil
	}

	return s.db.DB().Transaction(func(tx *gorm.DB) error {
		// 1. Find payment by external_id
		var p models.Payment
		if err := tx.Where("external_id = ?", externalID).First(&p).Error; err != nil {
			return err
		}

		// 2. Update payment status
		p.Status = paymentStatus
		if paymentStatus == "paid" {
			now := time.Now()
			p.PaidAt = &now
		}
		if err := tx.Save(&p).Error; err != nil {
			return err
		}

		// 3. Fetch current order before updating
		var currentOrder models.Order
		if err := tx.First(&currentOrder, p.OrderID).Error; err != nil {
			return err
		}
		fromStatus := currentOrder.Status

		// 4. Update order status
		if err := tx.Model(&models.Order{}).Where("id = ?", p.OrderID).Update("status", orderStatus).Error; err != nil {
			return err
		}

		// 5. Record status history (ChangedBy = nil → system/webhook)
		history := models.OrderStatusHistory{
			OrderID:    p.OrderID,
			FromStatus: fromStatus,
			ToStatus:   orderStatus,
			ChangedBy:  nil,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		// 6. If order becomes paid, deduct stock and record inventory movement
		if orderStatus == "paid" && fromStatus != "paid" {
			var orderItems []models.OrderItem
			if err := tx.Where("order_id = ?", p.OrderID).Find(&orderItems).Error; err != nil {
				return err
			}

			for _, item := range orderItems {
				// Lock product to prevent race condition
				var product models.Product
				if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&product, item.ProductID).Error; err != nil {
					return err
				}

				quantityBefore := product.Stock
				quantityChange := -int(item.Quantity)
				quantityAfter := quantityBefore + quantityChange

				// Prevent negative stock
				if quantityAfter < 0 {
					return errors.New("insufficient stock for product: " + product.Name)
				}

				// Update stock and availability
				isAvailable := quantityAfter > 0
				if err := tx.Model(&product).Updates(map[string]interface{}{
					"stock":        quantityAfter,
					"is_available": isAvailable,
				}).Error; err != nil {
					return err
				}

				// Create InventoryMovement (type: order)
				movement := models.InventoryMovement{
					ProductID:      item.ProductID,
					Type:           "order",
					QuantityBefore: quantityBefore,
					QuantityChange: quantityChange,
					QuantityAfter:  quantityAfter,
					Notes:          "Order payment success: #" + currentOrder.OrderNumber,
					CreatedBy:      currentOrder.UserID,
				}
				if err := tx.Create(&movement).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (s *PaymentService) GetPaymentDetail(id uint, userID uint) (*dto.PaymentDetailResponse, error) {
	paymentModel, err := s.paymentRepo.GetPaymentByIDAndUserID(id, userID)
	if err != nil {
		return nil, err
	}

	return &dto.PaymentDetailResponse{
		ID:         paymentModel.ID,
		Amount:     paymentModel.Amount,
		Status:     paymentModel.Status,
		PaymentURL: paymentModel.PaymentURL,
		ExternalID: paymentModel.ExternalID,
	}, nil
}
