import { AlignCenter, AlignLeft, Bold, Italic, List, Type } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite sua legenda aqui...",
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      
      // Mantém as quebras de linha como estão
      content = content
        .replace(/<div><br><\/div>/g, '<br>')
        .replace(/<div>/g, '<br>')
        .replace(/<\/div>/g, '')
        .replace(/^<br>/, '');
      
      onChange(content);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // Substitui quebras de linha por <br>
    const formattedText = text.replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, formattedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Permitir Ctrl+B para negrito
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      handleCommand('bold');
    }
    // Permitir Ctrl+I para itálico
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      handleCommand('italic');
    }
    // Enter para quebra de linha
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  };

  // Atualiza o conteúdo quando o value prop muda
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Limpa formatação desnecessária
  const cleanFormatting = () => {
    handleCommand('removeFormat');
  };

  const isEmpty = !value || value.trim() === '' || value === '<br>';

  return (
    <div className={cn("relative border border-input rounded-md bg-dark-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-dark-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-dark-3 hover:text-primary-500"
            onClick={() => handleCommand('bold')}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-dark-3 hover:text-primary-500"
            onClick={() => handleCommand('italic')}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-dark-3 mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-dark-3 hover:text-primary-500"
            onClick={() => handleCommand('insertUnorderedList')}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-dark-3 mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-dark-3 hover:text-primary-500"
            onClick={() => handleCommand('justifyLeft')}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-dark-3 hover:text-primary-500"
            onClick={() => handleCommand('justifyCenter')}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-dark-3 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-dark-3 hover:text-primary-500"
          onClick={cleanFormatting}
          title="Limpar formatação"
        >
          <Type className="h-4 w-4 mr-1" />
          <span className="text-xs">Limpar</span>
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "min-h-[120px] p-3 text-sm text-light-1 outline-none",
            "focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3",
            "rich-text-content"
          )}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />

        {/* Placeholder */}
        {isEmpty && !isFocused && (
          <div className="absolute top-3 left-3 text-light-4 text-sm pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="px-3 py-2 text-xs text-light-4 border-t border-dark-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <span className="text-light-3">Ctrl+B</span> negrito
          </span>
          <span>
            <span className="text-light-3">Ctrl+I</span> itálico
          </span>
          <span>
            <span className="text-light-3">Enter</span> nova linha
          </span>
        </div>
      </div>
    </div>
  );
};

export {RichTextEditor};