package models

type FamilyTree struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}
