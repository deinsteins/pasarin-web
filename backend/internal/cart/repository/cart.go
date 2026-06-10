package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type CartRepository struct {
	db *database.Database
}

func NewCartRepository(db *database.Database) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) GetCartByUserID(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := r.db.DB().Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *CartRepository) CreateCart(cart *models.Cart) error {
	return r.db.DB().Create(cart).Error
}

func (r *CartRepository) GetCartItem(cartID uint, productID uint) (*models.CartItem, error) {
	var item models.CartItem
	err := r.db.DB().Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CartRepository) CreateCartItem(item *models.CartItem) error {
	return r.db.DB().Create(item).Error
}

func (r *CartRepository) UpdateCartItem(item *models.CartItem) error {
	return r.db.DB().Save(item).Error
}

func (r *CartRepository) GetProductByID(productID uint) (*models.Product, error) {
	var product models.Product
	err := r.db.DB().First(&product, productID).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *CartRepository) GetCartItemsWithProduct(cartID uint) ([]models.CartItem, error) {
	var items []models.CartItem
	err := r.db.DB().
		Preload("Product").
		Preload("Product.Seller").
		Where("cart_id = ?", cartID).
		Find(&items).Error
	return items, err
}

func (r *CartRepository) GetCartItemByID(id uint) (*models.CartItem, error) {
	var item models.CartItem
	err := r.db.DB().First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CartRepository) GetCartByID(cartID uint) (*models.Cart, error) {
	var cart models.Cart
	err := r.db.DB().First(&cart, cartID).Error
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *CartRepository) DeleteCartItem(id uint) error {
	return r.db.DB().Delete(&models.CartItem{}, id).Error
}
