package service

import (
	"errors"
	"math"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/order/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/order/repository"
)

type OrderService struct {
	repo *repository.OrderRepository
}

func NewOrderService(repo *repository.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
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
		Items: itemsResponse,
	}
}
