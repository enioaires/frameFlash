import AdventureForm from '@/components/forms/AdventureForm';
import { Edit } from 'lucide-react';
import Loader from '@/components/shared/Loader';
import { useGetAdventureById } from '@/lib/react-query/adventures';
import { useParams } from 'react-router-dom';

const EditAdventure = () => {
  const { id } = useParams<{ id: string }>();
  const { data: adventure, isLoading, isError } = useGetAdventureById(id || '');

  if (isLoading) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="flex-center w-full h-full">
            <Loader text="Carregando aventura..." />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !adventure) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Aventura não encontrada</p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary-500 hover:text-primary-400 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Edit className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h2 className="h3-bold md:h2-bold text-left w-full">Editar Aventura</h2>
            <p className="text-light-4 mt-1">
              Atualize as informações de "{adventure.title}"
            </p>
          </div>
        </div>
        
        <AdventureForm action="update" adventure={adventure} />
      </div>
    </div>
  );
};

export default EditAdventure;