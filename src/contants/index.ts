import {
  Book,
  Bookmark,
  Castle,
  Home,
  Map,
  Plus,
  Sword,
  User,
  Users,
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
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fac80000f71982f3/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/mundo",
    label: "O Mundo",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad2002b2704740c/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/personagens",
    label: "Personagens",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa900015b0c7f7cb/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/classes",
    label: "Classes",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fadb0013ee894d37/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/racas",
    label: "Raças",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa96003c5883eade/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/deuses",
    label: "Deuses",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa81001769e00c73/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/artefatos",
    label: "Artefatos",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa8a002f803f1acc/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/aventuras",
    label: "Aventuras",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fade0031b898aff2/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/relato",
    label: "Relatos",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fae60019d142dc6f/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/rpg",
    label: "RPG",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faa6002492050434/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/jogadores",
    label: "Jogadores",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faad001dc83bf15d/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/magias",
    label: "Magias",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faed0008b77d04ab/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/talentos",
    label: "Talentos",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa9a00396a877a41/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/inventario",
    label: "Inventário",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa9f000af690c9ed/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
    route: "/tag/irmandades",
    label: "Irmandades",
    category: "rpg"
  },
  {
    icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad600128cc08c0b/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
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