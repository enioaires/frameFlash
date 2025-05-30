import { allMenuCategories } from "@/contants";

export const getAvailableTags = () => {
  // Usa o menu expandido com todas as categorias para gerar as tags
  const excludedRoutes = ["/", "/saved", "/create-post", "/all-users"];
  
  const validTags = allMenuCategories
    .filter(link => !excludedRoutes.includes(link.route) && link.route.startsWith('/tag/'))
    .map(link => ({
      label: link.label,
      value: link.label.toLowerCase()
    }));
  

  
  // Combina e remove duplicatas
  const allTags = [...validTags];
  const uniqueTags = allTags.filter((tag, index, array) => 
    array.findIndex(t => t.value === tag.value) === index
  );
  
  return uniqueTags.sort((a, b) => a.label.localeCompare(b.label));
};