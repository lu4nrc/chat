import React from "react";

const Maintenance = () => {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="p-24">
        <h1 className="font-normal text-2xl text-primary">
          <strong>Ops!</strong> Estamos trabalhando para melhorar!
        </h1>
        <p className="text-muted-foreground">
          No momento, esta página está em manutenção para trazer novidades
          incríveis para você! 🎉
        </p>
        <p className="text-muted-foreground">
          Aguarde só mais um pouquinho, e logo tudo estará de volta, melhor do
          que nunca! 💪✨
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
