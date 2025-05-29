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
  
  // Adiciona tags extras que podem não estar no menu
  const extraTags = [
    { label: 'Aventura', value: 'aventura' },
    { label: 'História', value: 'historia' },
    { label: 'Crônica', value: 'cronica' },
    { label: 'Campanha', value: 'campanha' },
    { label: 'NPC', value: 'npc' },
    { label: 'Monstro', value: 'monstro' },
    { label: 'Artefato', value: 'artefato' },
    { label: 'Local', value: 'local' },
    { label: 'Evento', value: 'evento' },
    { label: 'Organização', value: 'organizacao' },
  ];
  
  // Combina e remove duplicatas
  const allTags = [...validTags, ...extraTags];
  const uniqueTags = allTags.filter((tag, index, array) => 
    array.findIndex(t => t.value === tag.value) === index
  );
  
  return uniqueTags.sort((a, b) => a.label.localeCompare(b.label));
};