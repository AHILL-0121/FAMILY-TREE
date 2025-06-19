package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/example/familytree-backend/models"
)

func GetMembers(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		treeId := c.Params("treeId")
		var members []models.Member
		db.Where("tree_id = ?", treeId).Find(&members)
		return c.JSON(members)
	}
}

func GetMember(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		treeId := c.Params("treeId")
		id := c.Params("id")
		var member models.Member
		if err := db.Where("tree_id = ? AND id = ?", treeId, id).First(&member).Error; err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
		}
		return c.JSON(member)
	}
}

func CreateMember(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		treeId := c.Params("treeId")
		var member models.Member
		if err := c.BodyParser(&member); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		member.TreeID = parseUint(treeId)
		member.CreatedAt = time.Now().Unix()
		member.UpdatedAt = time.Now().Unix()
		if err := db.Create(&member).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusCreated).JSON(member)
	}
}

func UpdateMember(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		treeId := c.Params("treeId")
		id := c.Params("id")
		var member models.Member
		if err := db.Where("tree_id = ? AND id = ?", treeId, id).First(&member).Error; err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
		}
		var update models.Member
		if err := c.BodyParser(&update); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		member.Name = update.Name
		member.Generation = update.Generation
		member.X = update.X
		member.Y = update.Y
		member.ParentIDs = update.ParentIDs
		member.Children = update.Children
		member.SpouseID = update.SpouseID
		member.UpdatedAt = time.Now().Unix()
		if err := db.Save(&member).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(member)
	}
}

func DeleteMember(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		treeId := c.Params("treeId")
		id := c.Params("id")
		if err := db.Where("tree_id = ? AND id = ?", treeId, id).Delete(&models.Member{}).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(http.StatusNoContent)
	}
}

func parseUint(s string) uint {
	n, _ := strconv.ParseUint(s, 10, 64)
	return uint(n)
}
