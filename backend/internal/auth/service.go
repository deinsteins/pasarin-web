package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type AuthService struct {
	db *database.Database
}

func NewAuthService(db *database.Database) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Register(name, email, password, phone string) error {
	var emailCount int64
	s.db.DB().Model(&models.User{}).Where("email = ?", email).Count(&emailCount)

	if emailCount > 0 {
		return errors.New("email already exists")
	}

	var phoneCount int64
	s.db.DB().Model(&models.User{}).Where("phone = ?", phone).Count(&phoneCount)

	if phoneCount > 0 {
		return errors.New("phone number already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Phone:    phone,
		Password: string(hashedPassword),
		Role:     "customer",
	}

	return s.db.DB().Create(user).Error
}

func (s *AuthService) Login(identifier, password string) (string, error) {
	var user models.User
	if err := s.db.DB().Where("email = ? OR phone = ?", identifier, identifier).First(&user).Error; err != nil {
		return "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token := generateToken(user.ID, user.Email)

	return token, nil
}

func (s *AuthService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.DB().First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func generateToken(userID uint, email string) string {
	secretKey := "your-secret-key"
	claims := &JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secretKey))

	return tokenString
}

type JWTClaims struct {
	UserID         uint                    `json:"user_id"`
	Email          string                  `json:"email"`
	jwt.RegisteredClaims
}
