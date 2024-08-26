import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const QueuesCard = ({ queuesData, loading }) => {
  if (loading) {
    return <div>Carregando dados...</div>; // Personalize o indicador de loading aqui
  }
  return (
    queuesData && (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Detalhamento de atendimentos por clientes
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <a href="#">
              Veja todos
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clientes</TableHead>
                <TableHead className="">Resolvidos</TableHead>
                <TableHead className="">Temp. Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queuesData.map((el) => (
                <TableRow key={el.id}>
                  <TableCell>
                  <div className="flex gap-2 items-center">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>OM</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{el.queue_name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="">
                    <Badge className="text-xs" variant="outline">
                      {el.open}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
                    <Badge className="text-xs" variant="outline">
                      {el.pending}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
                    <Badge className="text-xs" variant="outline">
                      {el.closed}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell lg:">
                    5:00
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  );
};

export default QueuesCard;
