export const saveRecipe = (recipe) => {
  const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || []
  savedRecipes.push(recipe)
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes))
}

export const loadRecipes = () => {
  return JSON.parse(localStorage.getItem("savedRecipes")) || []
}
