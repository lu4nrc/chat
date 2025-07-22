import React, { useEffect, useState } from 'react';
import { contactsApi, tagsApi } from '@/services/api';
import toastError from '@/errors/toastError';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const tagColors = {
  user: 'bg-pink-500/20 text-pink-600',
  enterprise: 'bg-blue-500/20 text-blue-600',
  green: 'bg-green-500/20 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  custom: 'bg-orange-500/20 text-orange-600',
};

const Tags = ({ contact }) => {
  const [tags, setTags] = useState([]);
  const [filter, setFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await tagsApi.getAll();
        const allTags = data.tags || [];
        setTags(allTags);

        const types = Array.from(new Set(allTags.map((tag) => tag.typetag)));
        setAvailableTypes(types);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar tags',
          description: toastError(error),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [toast]);

  const handleSaveTag = async (tag) => {
    const tagExists = contact.tagslist.some((t) => t.id === tag.id);
    if (tagExists) return;

    setSavingId(tag.id);

    try {
      const updatedContact = {
        ...contact,
        tagslist: [...contact.tagslist, tag],
      };
      await contactsApi.update(contact.id, updatedContact);
      toast({ variant: 'default', title: `Tag "${tag.name}" adicionada!` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar tag',
        description: toastError(error),
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveTag = async (tag) => {
    setSavingId(tag.id);

    try {
      const updatedTags = contact.tagslist.filter((t) => t.id !== tag.id);
      const updatedContact = {
        ...contact,
        tagslist: updatedTags,
      };
      await contactsApi.update(contact.id, updatedContact);
      toast({ variant: 'default', title: `Tag "${tag.name}" removida!` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover tag',
        description: toastError(error),
      });
    } finally {
      setSavingId(null);
    }
  };

  const toggleTypeFilter = (type) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredTags = tags.filter((tag) => {
    const matchesText = tag.name.toLowerCase().includes(filter.toLowerCase());
    const matchesType =
      typeFilters.length === 0 || typeFilters.includes(tag.typetag);
    return matchesText && matchesType;
  });

  return (
    <Card className="w-full shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Gerenciar Tags</CardTitle>

        <div className="relative mt-2">
          {/* TAGS DO CONTATO */}
          {contact.tagslist.length > 0 && (
            <div className="mb-4 border rounded-lg border-dashed p-4 bg-muted/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                Tags do Contato
              </h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {contact.tagslist.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={cn(
                      'px-3 py-1 rounded-full hover:opacity-90 hover:text-foreground text-xs flex items-center gap-1',
                      tagColors[tag.typetag],
                      savingId === tag.id && 'opacity-50 pointer-events-none'
                    )}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1"
                      aria-label={`Remover tag ${tag.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">
            Tags Disponíveis
          </h4>
          <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filtrar tags..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        {availableTypes.length > 0 && (
          <div className="mb-2 flex">
            {availableTypes.map((type) => (
              <Label
                key={type}
                className="flex items-center justify-between text-sm gap-1 p-1"
              >
                <Switch
                  checked={typeFilters.includes(type)}
                  onCheckedChange={() => toggleTypeFilter(type)}
                />
                {type === 'user'
                  ? 'Usuários'
                  : type === 'enterprise'
                  ? 'Empresas'
                  : 'Personalizadas'}
              </Label>
            ))}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const isSaving = savingId === tag.id;
                const alreadyAdded = contact.tagslist.some(
                  (t) => t.id === tag.id
                );
                return (
                  <Badge
                    key={tag.id}
                    onClick={() => handleSaveTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs cursor-pointer hover:opacity-90 hover:text-foreground transition-all flex items-center gap-1',
                      tagColors[tag.typetag],
                      (isSaving || alreadyAdded) &&
                        'opacity-50 pointer-events-none'
                    )}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        {tag.name}
                        <Plus className="h-3 w-3" />
                      </>
                    )}
                  </Badge>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma tag encontrada.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Tags;
