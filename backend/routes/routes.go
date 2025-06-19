package routes

import (
	"github.com/example/familytree-backend/handlers"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB) {
	api := app.Group("/api")

	// Family trees
	api.Get("/trees", handlers.ListFamilyTrees(db))
	api.Post("/trees", handlers.CreateFamilyTree(db))
	api.Get("/trees/:id", handlers.GetFamilyTree(db))

	// Members (scoped to tree)
	api.Get("/trees/:treeId/members", handlers.GetMembers(db))
	api.Get("/trees/:treeId/members/:id", handlers.GetMember(db))
	api.Post("/trees/:treeId/members", handlers.CreateMember(db))
	api.Put("/trees/:treeId/members/:id", handlers.UpdateMember(db))
	api.Delete("/trees/:treeId/members/:id", handlers.DeleteMember(db))
}
