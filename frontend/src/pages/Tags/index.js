import React, { useEffect } from "react";


import TagModal from "../../components/TagModal";

import api from "../../services/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import toastError from "@/errors/toastError";
import { useToast } from "@/hooks/use-toast";


const Tags = () => {
  const { toast } = useToast()
  const [userstag, setUserTags] = React.useState([]);
  const [enterprisestags, setEnterprisesTags] = React.useState([]);
  const [customstags, setCustomTags] = React.useState([]);
  const [tagOpen, setTagOpen] = React.useState(false);
  const [v, setV] = React.useState(null);

  const handleCloseTag = async () => {
    setTagOpen(false);

    try {
      const result = await api.get("tags");
      setUserTags(result.data.tags.filter((x) => x?.typetag === "user") || []);
      setEnterprisesTags(
        result.data.tags.filter((x) => x?.typetag === "enterprise") || []
      );
      setCustomTags(
        result.data.tags.filter((x) => x?.typetag === "custom") || []
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }

    setV(null);
  };

  const handleEditTag = (value) => {
    setV(value);
    setTagOpen(true);
  };

  useEffect(() => {}, [v]);

  const handleDeleteTag = async (id) => {
    try {
      await api.delete(`/tags/${id}`).then(() => loadTags());
      toast({
        variant: "success",
        title: "Sucesso!",
        description: "Tag apagada",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  const TagItem = ({ value }) => {
    return (
      <div className="flex justify-between w-full bg-muted rounded-sm py-2 px-2 mb-1">
        <Badge
          className={cn(
            "",
            value.typetag === "user"
              ? ""
              : value.typetag === "enterprise"
              ? ""
              : ""
          )}
        >
          {value.name}
        </Badge>
        {/*    <Chip
          label={value.name}
          className={
            value.typetag === "user"
              ? "classes.chipUser"
              : value.typetag === "enterprise"
              ? "classes.chipEnterprise "
              : "classes.chipCustom"
          }
        /> */}

        <div className="flex gap-1">
          <div
            onClick={() => {
              handleEditTag(value);
            }}
          >
            <Edit size={18} />
          </div>
          <div onClick={() => handleDeleteTag(value.id)}>
            <Trash size={18} />
          </div>
        </div>
      </div>
    );
  };
  const loadTags = async () => {
    try {
      const result = await api.get("tags");
      setUserTags(result.data.tags.filter((x) => x?.typetag === "user") || []);
      setEnterprisesTags(
        result.data.tags.filter((x) => x?.typetag === "enterprise") || []
      );
      setCustomTags(
        result.data.tags.filter((x) => x?.typetag === "custom") || []
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };
  React.useEffect(() => {
    loadTags();
  }, []);

  return (
    <div className="flex gap-1">
      <div className="pt-1 flex flex-col gap-1 w-full">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            Atendimentos
          </h2>
          <Button disabled onClick={() => setTagOpen(true)}>
            <Plus /> Adicionar Tag
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Tags de usuário</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)] w-full ">
                {userstag.map((value) => (
                  <TagItem key={value.id} value={value} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Empresas</CardTitle>
              <CardDescription>Tags de empresas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)] w-full ">
                {enterprisestags.map((value) => (
                  <TagItem key={value.id} value={value} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalizadas</CardTitle>
              <CardDescription>Tags personalizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)] w-full ">
                {customstags.map((value) => (
                  <TagItem key={value.id} value={value} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <TagModal open={tagOpen} onClose={handleCloseTag} value={v} />
        </div>
      </div>
    </div>
  );
};

export default Tags;
