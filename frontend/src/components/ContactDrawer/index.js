import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Tags from "./Tags";
import { useState } from "react";

export default function ContactDrawer({ contact }) {
  const [open, setOpen] = useState(false);
  function formatPhoneNumber(phoneNumber) {
    // Remove todos os caracteres não numéricos
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");

    // Verifica se o número de telefone tem o tamanho correto
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    // Retorna o número original se não for possível formatar
    return phoneNumber;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="h-12 w-12" alt="contact_image">
          <AvatarImage src={contact.profilePicUrl} alt="@contact" />
          <AvatarFallback>HC</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Informações do contato</DialogTitle>
          <DialogDescription>
            Adicione tags e Informações relevantes
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={contact.profilePicUrl} alt={contact.name} />
              <AvatarFallback>HC</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className=" font-medium">{contact.name}</p>
              <p className="text-sm text-muted-foreground">
                {contact.number ? formatPhoneNumber(contact.number) : null}
              </p>
            </div>
          </div>

          {contact?.extraInfo?.map(
            (info) =>
              info.value && (
                <div
                  key={info.id}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor="username" className="text-right">
                    {info.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{info.value}</p>
                </div>
              )
          )}
          <Tags contact={contact} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
