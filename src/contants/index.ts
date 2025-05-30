import {
  Backpack,
  Book,
  Bookmark,
  Castle,
  Crown,
  Earth,
  Home,
  Map,
  Plus,
  Scroll,
  Sparkles,
  Sword,
  User,
  Users,
  Zap
} from "lucide-react";

export const sidebarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Início",
  },
  {
    icon: Sword,
    route: "/tag/item",
    label: "Items",
  },
  {
    icon: Book,
    route: "/tag/lore",
    label: "Lore",
  },
  {
    icon: Users,
    route: "/tag/classe",
    label: "Classes",
  },
  {
    icon: User,
    route: "/tag/raca",
    label: "Raças",
  },
  {
    icon: Map,
    route: "/tag/regiao",
    label: "Regiões",
  },
  {
    icon: Bookmark,
    route: "/saved",
    label: "Salvos",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
  },
];

export const bottombarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Início",
  },
  {
    icon: Users,
    route: "/all-users",
    label: "Usuários",
  },
  {
    icon: Sword,
    route: "/tag/item",
    label: "Items",
  },
  {
    icon: Book,
    route: "/tag/lore",
    label: "Lore",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
  },
];

// Menu expandido com todas as categorias
export const allMenuCategories = [
  {
    icon: Home,
    route: "/",
    label: "Início",
    category: "main"
  },
  // RPG Core
  {
    icon: Earth,
    route: "/tag/mundo",
    label: "O Mundo",
    category: "rpg"
  },
  {
    icon: Crown,
    route: "/tag/personagens",
    label: "Personagens",
    category: "rpg"
  },
  {
    icon: User,
    route: "/tag/classes",
    label: "Classes",
    category: "rpg"
  },
  {
    icon: User,
    route: "/tag/racas",
    label: "Raças",
    category: "rpg"
  },
  {
    icon: Crown,
    route: "/tag/deuses",
    label: "Deuses",
    category: "rpg"
  },
  {
    icon: Sword,
    route: "/tag/artefatos",
    label: "Artefatos",
    category: "rpg"
  },
  {
    icon: Castle,
    route: "/tag/aventuras",
    label: "Aventuras",
    category: "rpg"
  },
  {
    icon: Scroll,
    route: "/tag/relato",
    label: "Relatos",
    category: "rpg"
  },
  {
    icon: Scroll,
    route: "/tag/rpg",
    label: "RPG",
    category: "rpg"
  },
  {
    icon: Users,
    route: "/tag/jogadores",
    label: "Jogadores",
    category: "rpg"
  },
  {
    icon: Zap,
    route: "/tag/magias",
    label: "Magias",
    category: "rpg"
  },
  {
    icon: Sparkles,
    route: "/tag/talentos",
    label: "Talentos",
    category: "rpg"
  },
  {
    icon: Backpack,
    route: "/tag/inventario",
    label: "Inventário",
    category: "rpg"
  },
  {
    icon: Users,
    route: "/tag/irmandades",
    label: "Irmandades",
    category: "rpg"
  },
  {
    icon: Book,
    route: "/tag/produtos",
    label: "Produtos",
    category: "rpg"
  },

  // Sistema
  {
    icon: Bookmark,
    route: "/saved",
    label: "Salvos",
    category: "system"
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
    category: "system"
  },
  {
    icon: Castle,
    route: "/adventures",
    label: "Aventuras",
    category: "system"
  },
];