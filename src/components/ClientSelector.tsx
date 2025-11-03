'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Client {
  id: string;
  code: string;
  name: string;
  regions: string[];
  departments: string[];
}

interface ClientSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCreate?: boolean;
  onCreateNew?: () => void;
  className?: string;
}

export function ClientSelector({
  value,
  onChange,
  placeholder = 'Select a client...',
  allowCreate = false,
  onCreateNew,
  className,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((client) => client.id === value);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selectedClient ? (
            <div className="flex items-center space-x-2">
              <span className="font-medium">{selectedClient.name}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedClient.code}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search clients..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="py-6 text-center text-sm">
                  Loading clients...
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  No clients found.
                  {allowCreate && onCreateNew && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        onCreateNew();
                      }}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create new client
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === '' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="text-muted-foreground">No client</span>
              </CommandItem>
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  onSelect={() => {
                    onChange(client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === client.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{client.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {client.code}
                      </Badge>
                    </div>
                    {client.regions.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Regions: {client.regions.join(', ')}
                      </div>
                    )}
                    {client.departments.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Departments: {client.departments.join(', ')}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && onCreateNew && filteredClients.length > 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onCreateNew();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create new client</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}