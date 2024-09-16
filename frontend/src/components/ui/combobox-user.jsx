import { useEffect, useState, useCallback } from "react";
import { ChevronsUpDown, Check, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import api from "@/services/api";
import ModalProfileCors from "../ModalProfileCors";

export default function ComboboxUser({ setUser }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState();
  const [searchParam, setSearchParam] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const handleSetActive = useCallback((user) => {
    setSelected(user);
    setUser(user);
    setOpen(false);
  }, []);

  const displayName = selected ? selected.name : "Selecionar usuário";

  useEffect(() => {
    if (searchParam.length < 3) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });

          setData(data.users);

          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("justify-between w-[400px]")}
        >
          {displayName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className={cn("p-0 w-[400px]")}>
        <Command
          shouldFilter={false}
          className="h-auto rounded-lg border border-b-0 shadow-md"
        >
          <CommandInput
            value={searchParam}
            onValueChange={setSearchParam}
            placeholder="Procurar contato"
          />
          <SearchResults
            query={searchParam}
            selectedResult={selected}
            onSelectResult={handleSetActive}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
            data={data}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Search results component
function SearchResults({ data, selectedResult, onSelectResult, isLoading }) {
  return (
    <CommandList>
      {isLoading && <div className="p-4 text-sm">Procurando...</div>}
      {!isLoading && !data.length && (
        <div className="p-4 text-sm">Contato não encontrado</div>
      )}

      {data.map(({ id, name, imageUrl, queues }) => (
        <CommandItem
          key={id}
          onSelect={() => onSelectResult({ id, name, queues, imageUrl })}
          value={name}
          className="flex gap-1"
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              selectedResult?.id === id ? "opacity-100" : "opacity-0"
            )}
          />
          <div className="flex gap-1 items-center">
            <ModalProfileCors imageUrl={imageUrl} />
            <p className="font-medium">{name}</p>
          </div>
        </CommandItem>
      ))}
    </CommandList>
  );
}
