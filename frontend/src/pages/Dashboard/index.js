import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, File, ListFilter, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Today from "./today";
import SevenDays from "./seven";
import FourteenDays from "./fourteen";

const Dashboard = () => {
  return (
    <div className=" grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Dashboard
        </h1>
        <Badge className="ml-auto sm:ml-0">Beta</Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          {/* //TODO: Colocar botao perfil */}
        </div>
      </div>
      <Tabs defaultValue="today">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="seven" className="flex gap-1">
              <Crown className="w-3 h-3" />7 Dias
            </TabsTrigger>
            <TabsTrigger value="fourteen" className="flex gap-1">
              <Crown className="w-3 h-3" />
              14 dias
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtrar
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button disabled size="sm" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar dados
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="today">
          <Today />
        </TabsContent>
        <TabsContent value="seven">
          <SevenDays />
        </TabsContent>
        <TabsContent value="fourteen">
          <FourteenDays />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
