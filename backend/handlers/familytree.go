package handlers

import (
	"net/http"

	"github.com/example/familytree-backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func ListFamilyTrees(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var trees []models.FamilyTree
		db.Find(&trees)
		return c.JSON(trees)
	}
}

func CreateFamilyTree(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tree models.FamilyTree
		if err := c.BodyParser(&tree); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		if err := db.Create(&tree).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		// Add root member
		root := models.Member{
			TreeID:     tree.ID,
			Name:       "Root Person",
			Generation: 0,
			X:          400, Y: 300,
			ParentIDs: "",
			Children:  "",
			SpouseID:  nil,
			CreatedAt: 0, UpdatedAt: 0,
		}
		db.Create(&root)
		return c.JSON(tree)
	}
}

func GetFamilyTree(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var tree models.FamilyTree
		if err := db.Where("id = ?", id).First(&tree).Error; err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Tree not found"})
		}
		return c.JSON(tree)
	}
}
