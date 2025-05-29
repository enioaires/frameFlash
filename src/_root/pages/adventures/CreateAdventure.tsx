import AdventureForm from '@/components/forms/AdventureForm';
import { Plus } from 'lucide-react';

const CreateAdventure = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Plus className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h2 className="h3-bold md:h2-bold text-left w-full">Criar Nova Aventura</h2>
            <p className="text-light-4 mt-1">
              Configure uma nova aventura para seus jogadores
            </p>
          </div>
        </div>
        
        <AdventureForm action="create" />
      </div>
    </div>
  );
};

export default CreateAdventure;