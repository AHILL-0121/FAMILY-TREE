package models

type Member struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	TreeID     uint   `json:"treeId"`
	Name       string `json:"name"`
	Generation int    `json:"generation"`
	X          int    `json:"x"`
	Y          int    `json:"y"`
	ParentIDs  string `json:"parentIds"` // Comma-separated IDs
	Children   string `json:"children"`  // Comma-separated IDs
	SpouseID   *uint  `json:"spouseId"`
	CreatedAt  int64  `json:"createdAt"`
	UpdatedAt  int64  `json:"updatedAt"`
}
