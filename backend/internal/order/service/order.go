package service

import (
	"errors"
	"math"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/order/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/order/repository"
	sellerRepository "github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
)

type OrderService struct {
	repo       *repository.OrderRepository
	sellerRepo *sellerRepository.SellerRepository
}

func NewOrderService(repo *repository.OrderRepository, sellerRepo *sellerRepository.SellerRepository) *OrderService {
	return &OrderService{
		repo:       repo,
		sellerRepo: sellerRepo,
	}
}

func (s *OrderService) GetOrderDetail(id uint, userID uint) (*dto.OrderDetailResponse, error) {
	order, err := s.repo.GetOrderByIDAndUserID(id, userID)
	if err != nil {
		return nil, err
	}

	return s.mapToOrderDetailResponse(order), nil
}

func (s *OrderService) GetOrderHistory(userID uint, page int, limit int) (*dto.PaginatedOrderResponse, error) {
	orders, total, err := s.repo.FindAllByUserID(userID, page, limit)
	if err != nil {
		return nil, err
	}

	var data []dto.OrderDetailResponse = []dto.OrderDetailResponse{}
	for _, order := range orders {
		data = append(data, *s.mapToOrderDetailResponse(&order))
	}

	lastPage := int64(math.Ceil(float64(total) / float64(limit)))
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.PaginatedOrderResponse{
		Data: data,
		Meta: dto.PaginationMeta{
			Page:     page,
			Limit:    limit,
			Total:    total,
			LastPage: lastPage,
		},
	}, nil
}

func (s *OrderService) GetAdminOrderList(adminUserID uint, status string, page int, limit int) (*dto.PaginatedAdminOrderResponse, error) {
	// 1. Authorize Admin role
	user, err := s.repo.GetUserByID(adminUserID)
	if err != nil {
		return nil, err
	}
	if user.Role != "admin" {
		return nil, errors.New("unauthorized")
	}

	// 2. Query admin orders
	orders, total, err := s.repo.GetAdminOrders(status, page, limit)
	if err != nil {
		return nil, err
	}

	var data []dto.AdminOrderResponse = []dto.AdminOrderResponse{}
	for _, order := range orders {
		var itemsResponse []dto.OrderItemResponse = []dto.OrderItemResponse{}
		for _, item := range order.OrderItems {
			itemsResponse = append(itemsResponse, dto.OrderItemResponse{
				ID:           item.ID,
				ProductID:    item.ProductID,
				SellerID:     item.SellerID,
				ProductName:  item.ProductName,
				ProductPrice: item.ProductPrice,
				Quantity:     item.Quantity,
				Subtotal:     item.Subtotal,
			})
		}

		data = append(data, dto.AdminOrderResponse{
			ID:          order.ID,
			OrderNumber: order.OrderNumber,
			UserID:      order.UserID,
			Status:      order.Status,
			Subtotal:    order.Subtotal,
			DeliveryFee: order.DeliveryFee,
			TotalAmount: order.TotalAmount,
			Notes:       order.Notes,
			CreatedAt:   order.CreatedAt.String(),
			UpdatedAt:   order.UpdatedAt.String(),
			User: dto.UserResponse{
				ID:    order.User.ID,
				Name:  order.User.Name,
				Email: order.User.Email,
				Role:  order.User.Role,
			},
			Address: dto.AddressResponse{
				ID:             order.Address.ID,
				Label:          order.Address.Label,
				RecipientName:  order.Address.RecipientName,
				RecipientPhone: order.Address.RecipientPhone,
				Province:       order.Address.Province,
				City:           order.Address.City,
				District:       order.Address.District,
				PostalCode:     order.Address.PostalCode,
				Address:        order.Address.Address,
			},
			Items: itemsResponse,
		})
	}

	lastPage := int64(math.Ceil(float64(total) / float64(limit)))
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.PaginatedAdminOrderResponse{
		Data: data,
		Meta: dto.PaginationMeta{
			Page:     page,
			Limit:    limit,
			Total:    total,
			LastPage: lastPage,
		},
	}, nil
}

func (s *OrderService) mapToOrderDetailResponse(order *models.Order) *dto.OrderDetailResponse {
	var itemsResponse []dto.OrderItemResponse = []dto.OrderItemResponse{}
	for _, item := range order.OrderItems {
		itemsResponse = append(itemsResponse, dto.OrderItemResponse{
			ID:           item.ID,
			ProductID:    item.ProductID,
			SellerID:     item.SellerID,
			ProductName:  item.ProductName,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		})
	}

	var paymentResponse *dto.PaymentInfoResponse
	if len(order.Payments) > 0 {
		latestPayment := order.Payments[0]
		for _, p := range order.Payments {
			if p.ID > latestPayment.ID {
				latestPayment = p
			}
		}
		paymentResponse = &dto.PaymentInfoResponse{
			Status:     latestPayment.Status,
			PaymentURL: latestPayment.PaymentURL,
		}
	}

	return &dto.OrderDetailResponse{
		ID:          order.ID,
		OrderNumber: order.OrderNumber,
		UserID:      order.UserID,
		Status:      order.Status,
		Subtotal:    order.Subtotal,
		DeliveryFee: order.DeliveryFee,
		TotalAmount: order.TotalAmount,
		Notes:       order.Notes,
		CreatedAt:   order.CreatedAt.String(),
		UpdatedAt:   order.UpdatedAt.String(),
		Address: dto.AddressResponse{
			ID:             order.Address.ID,
			Label:          order.Address.Label,
			RecipientName:  order.Address.RecipientName,
			RecipientPhone: order.Address.RecipientPhone,
			Province:       order.Address.Province,
			City:           order.Address.City,
			District:       order.Address.District,
			PostalCode:     order.Address.PostalCode,
			Address:        order.Address.Address,
		},
		Items:   itemsResponse,
		Payment: paymentResponse,
	}
}

func (s *OrderService) GetSellerOrderList(userID uint, status string, page int, limit int) (*dto.PaginatedSellerOrderResponse, error) {
	// 1. Authenticate Seller by UserID
	seller, err := s.sellerRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	// 2. Query orders containing the seller's items
	orders, total, err := s.repo.FindAllBySellerID(seller.ID, status, page, limit)
	if err != nil {
		return nil, err
	}

	var data []dto.SellerOrderResponse = []dto.SellerOrderResponse{}
	for _, order := range orders {
		var itemResponses []dto.SellerOrderItemResponse = []dto.SellerOrderItemResponse{}
		for _, item := range order.OrderItems {
			itemResponses = append(itemResponses, dto.SellerOrderItemResponse{
				ID:           item.ID,
				ProductID:    item.ProductID,
				ProductName:  item.ProductName,
				ProductPrice: item.ProductPrice,
				Quantity:     item.Quantity,
				Subtotal:     item.Subtotal,
			})
		}

		data = append(data, dto.SellerOrderResponse{
			ID:          order.ID,
			OrderNumber: order.OrderNumber,
			Status:      order.Status,
			Subtotal:    order.Subtotal,
			DeliveryFee: order.DeliveryFee,
			TotalAmount: order.TotalAmount,
			Notes:       order.Notes,
			CreatedAt:   order.CreatedAt.String(),
			UpdatedAt:   order.UpdatedAt.String(),
			Customer: dto.CustomerResponse{
				ID:    order.User.ID,
				Name:  order.User.Name,
				Email: order.User.Email,
			},
			Items: itemResponses,
		})
	}

	lastPage := int64(math.Ceil(float64(total) / float64(limit)))
	if lastPage == 0 {
		lastPage = 1
	}

	return &dto.PaginatedSellerOrderResponse{
		Data: data,
		Meta: dto.PaginationMeta{
			Page:     page,
			Limit:    limit,
			Total:    total,
			LastPage: lastPage,
		},
	}, nil
}
