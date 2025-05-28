import { bottombarLinks, sidebarLinks } from "@/contants";

export const getAvailableTags = () => {
  // Combina os links dos dois menus
  const allLinks = [...sidebarLinks, ...bottombarLinks];
  
  // Remove duplicatas e filtra apenas as tags válidas
  const uniqueLinks = allLinks.filter((link, index, array) => 
    array.findIndex(l => l.route === link.route) === index
  );
  
  // Exclui rotas que não devem ser tags
  const excludedRoutes = ["/", "/saved", "/create-post", "/all-users"];
  
  const validTags = uniqueLinks
    .filter(link => !excludedRoutes.includes(link.route))
    .map(link => ({
      label: link.label,
      value: link.label.toLowerCase()
    }));
  
  return validTags;
};