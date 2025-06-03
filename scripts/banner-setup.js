import { Client, Databases, ID } from 'appwrite';

// ⚠️ CONFIGURE SUAS VARIÁVEIS AQUI
const APPWRITE_CONFIG = {
  url: 'https://cloud.appwrite.io/v1', // Ex: https://cloud.appwrite.io/v1
  projectId: '653bbdb36f4fd0fbd9f7',
  databaseId: '653c1b9b344864711856',
  bannersCollectionId: '683f2f91000671441195', // ou o ID que você criou
};

// Imagem padrão (a mesma que está sendo usada atualmente)
const DEFAULT_IMAGE = {
  imageUrl: "https://fra.cloud.appwrite.io/v1/storage/buckets/6838e3a400362003b2ce/files/6838e3c700212167feae/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
  imageId: "6838e3c700212167feae"
};

// Lista de todas as tags baseada no seu código
const TAGS = [
  { identifier: 'mundo', title: 'O Mundo' },
  { identifier: 'personagens', title: 'Personagens' },
  { identifier: 'classes', title: 'Classes' },
  { identifier: 'racas', title: 'Raças' },
  { identifier: 'deuses', title: 'Deuses' },
  { identifier: 'artefatos', title: 'Artefatos' },
  { identifier: 'aventuras', title: 'Aventuras' },
  { identifier: 'relato', title: 'Relatos' },
  { identifier: 'rpg', title: 'RPG' },
  { identifier: 'jogadores', title: 'Jogadores' },
  { identifier: 'magias', title: 'Magias' },
  { identifier: 'talentos', title: 'Talentos' },
  { identifier: 'inventario', title: 'Inventário' },
  { identifier: 'irmandades', title: 'Irmandades' },
  { identifier: 'produtos', title: 'Produtos' }
];

// Inicializar cliente Appwrite
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.url)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

async function createBanners() {
  try {
    console.log('🚀 Iniciando criação dos banners...\n');

    // 1. Criar banner principal (home)
    console.log('📱 Criando banner principal...');
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bannersCollectionId,
      ID.unique(),
      {
        type: 'home',
        identifier: 'main',
        imageUrl: DEFAULT_IMAGE.imageUrl,
        imageId: DEFAULT_IMAGE.imageId,
        title: 'Banner Principal'
      }
    );
    console.log('✅ Banner principal criado!');

    // 2. Criar banners para cada tag
    console.log('\n🏷️ Criando banners das tags...');
    
    for (const tag of TAGS) {
      try {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.bannersCollectionId,
          ID.unique(),
          {
            type: 'tag',
            identifier: tag.identifier,
            imageUrl: DEFAULT_IMAGE.imageUrl,
            imageId: DEFAULT_IMAGE.imageId,
            title: `Banner - ${tag.title}`
          }
        );
        console.log(`✅ Banner criado para: ${tag.title} (${tag.identifier})`);
      } catch (error) {
        console.error(`❌ Erro ao criar banner para ${tag.identifier}:`, error.message);
      }
    }

    console.log('\n🎉 Todos os banners foram criados com sucesso!');
    console.log(`📊 Total: 1 banner principal + ${TAGS.length} banners de tags = ${TAGS.length + 1} banners`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
createBanners();
