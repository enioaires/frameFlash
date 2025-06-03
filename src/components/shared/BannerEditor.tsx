import { Loader as LoaderIcon, Save, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Models } from 'appwrite';
import { convertFileToUrl } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateBanner } from '@/lib/react-query/banners';

interface BannerEditorProps {
  type: 'home' | 'tag';
  identifier: string;
  currentBanner?: Models.Document;
  onClose: () => void;
}

const BannerEditor: React.FC<BannerEditorProps> = ({
  type,
  identifier,
  currentBanner,
  onClose
}) => {
  const { toast } = useToast();
  const { mutateAsync: updateBanner, isPending } = useUpdateBanner();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState(currentBanner?.title || '');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, JPEG, WebP)."
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 10MB."
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(convertFileToUrl(file));
  };

  const handleSave = async () => {
    if (!selectedFile || !currentBanner) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem para continuar."
      });
      return;
    }

    try {
      await updateBanner({
        bannerId: currentBanner.$id,
        type,
        identifier,
        imageId: currentBanner.imageId,
        imageUrl: currentBanner.imageUrl,
        file: [selectedFile],
        title: title.trim() || undefined
      });

      toast({
        title: "Banner atualizado!",
        description: `O banner ${type === 'home' ? 'principal' : `da tag "${identifier}"`} foi atualizado com sucesso.`
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar banner",
        description: error.message || "Não foi possível atualizar o banner. Tente novamente."
      });
    }
  };

  const getBannerTitle = () => {
    if (type === 'home') return 'Banner Principal';
    
    const tagTitles: { [key: string]: string } = {
      mundo: 'O Mundo',
      personagens: 'Personagens',
      classes: 'Classes',
      racas: 'Raças',
      deuses: 'Deuses',
      artefatos: 'Artefatos',
      aventuras: 'Aventuras',
      relato: 'Relatos',
      rpg: 'RPG',
      jogadores: 'Jogadores',
      magias: 'Magias',
      talentos: 'Talentos',
      inventario: 'Inventário',
      irmandades: 'Irmandades',
      produtos: 'Produtos'
    };
    
    return tagTitles[identifier] || `Tag ${identifier}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-2 rounded-2xl border border-dark-4 max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-4">
          <div>
            <h2 className="text-xl font-bold text-light-1">
              Editar Banner
            </h2>
            <p className="text-light-4 text-sm mt-1">
              {getBannerTitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-light-3" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Banner Preview */}
          <div>
            <h3 className="text-lg font-semibold text-light-1 mb-3">Banner Atual</h3>
            <div className="relative">
              <img
                src={currentBanner?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt="Banner atual"
                className="w-full h-32 md:h-40 object-cover rounded-lg border border-dark-4"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Imagem Atual
                </span>
              </div>
            </div>
          </div>

          {/* New Banner Upload */}
          <div>
            <h3 className="text-lg font-semibold text-light-1 mb-3">Nova Imagem</h3>
            
            {/* File Input */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="banner-upload"
                disabled={isPending}
              />
              <label
                htmlFor="banner-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-4 rounded-lg cursor-pointer hover:border-primary-500/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-light-4 mb-2" />
                <span className="text-light-4 text-sm">
                  Clique para selecionar uma imagem
                </span>
                <span className="text-light-4 text-xs mt-1">
                  PNG, JPG, JPEG ou WebP (máx. 10MB)
                </span>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-light-1 mb-2">Preview</h4>
                <img
                  src={previewUrl}
                  alt="Preview da nova imagem"
                  className="w-full h-32 md:h-40 object-cover rounded-lg border border-primary-500/30"
                />
              </div>
            )}
          </div>

          {/* Optional Title */}
          <div>
            <label htmlFor="banner-title" className="block text-sm font-medium text-light-1 mb-2">
              Título (Opcional)
            </label>
            <Input
              id="banner-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título para o banner..."
              className="shad-input"
              disabled={isPending}
            />
            <p className="text-light-4 text-xs mt-1">
              Usado para organização interna. Não é exibido no site.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-4">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-light-3 hover:text-light-1"
              disabled={isPending}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!selectedFile || isPending}
              className="shad-button_primary"
            >
              {isPending ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Banner
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-dark-3/50 rounded-lg p-4 border border-dark-4">
            <h4 className="text-sm font-medium text-light-1 mb-2">💡 Dicas</h4>
            <ul className="text-light-4 text-xs space-y-1">
              <li>• Use imagens com alta resolução para melhor qualidade</li>
              <li>• Proporção recomendada: 16:9 ou similar</li>
              <li>• Evite texto na imagem, pois pode ficar ilegível em dispositivos móveis</li>
              <li>• A imagem será redimensionada automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerEditor;