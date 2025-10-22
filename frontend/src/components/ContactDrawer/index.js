import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Tags from './Tags';
import { useContext, useState } from 'react';
import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import formatarNumeroBR from '@/utils/numberFormat';
import { AuthContext } from '@/context/Auth/AuthContext';

export default function ContactDrawer({ contact }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useContext(AuthContext);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(contact.number)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reseta a mensagem após 2 segundos
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  // function formatPhoneNumber(phoneNumber) {
  //   // Remove todos os caracteres não numéricos
  //   const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  //   // Verifica se o número de telefone tem o tamanho correto
  //   const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/);
  //   if (match) {
  //     return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  //   }
  //   // Retorna o número original se não for possível formatar
  //   return phoneNumber;
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="h-12 w-12" alt="contact_image">
          <AvatarImage src={contact.profilePicUrl} alt="@contact" />
          <AvatarFallback>HC</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Informações do contato</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex gap-4 items-center">
            <Avatar className="hidden h-16 w-16 sm:flex">
              <AvatarImage src={contact.profilePicUrl} alt={contact.name} />
              <AvatarFallback>HC</AvatarFallback>
            </Avatar>
            <div className="grid items-center">
              <p className="text-m font-semibold">{contact.name}</p>

              <p className="text-sm text-muted-foreground inline-flex gap-2">
                {contact.number
                  ? formatarNumeroBR(contact.number, user.profile)
                  : null}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <div className="flex justify-center text-green-500 text-xs items-center gap-2">
                  <Check className="w-4 h-4 " /> Copiado!
                </div>
              ) : (
                <div className="flex justify-center items-center text-xs gap-2">
                  <Copy className="w-4 h-4" /> Copiar
                </div>
              )}
            </Button>
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
