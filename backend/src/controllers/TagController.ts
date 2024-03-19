import { Request, Response } from "express";

import AppError from "../errors/AppError";

import CreateTagService from "../services/TagService/CreateTagService";
import DeleteTagService from "../services/TagService/DeleteTagService";
import ListTagService from "../services/TagService/ListTagService";
import UpdateTagService from "../services/TagService/UpdateTagService";

interface Tag {
  id:number;
  name: string;
  value: string;
  typetag: string;
  createdAt:Date;
  updatedAt: Date;
}


export const show = async (
  req: Request, res: Response
) => {
  try {
    const tags = await ListTagService();
    return res.status(200).json(tags);
  } catch (e) {
    throw new AppError(`${e}`)
  }

};


export const store = async (
  req: Request, res: Response
) => {
  const newtag: Tag = req.body;
  const name = newtag.name
  const value = newtag.value
  const typetag = newtag.typetag

  if(typetag===""){
    throw new AppError(`Por favor, Selecione o tipo da tag!`)
  }

  try {
    const tag = await CreateTagService({ name, value, typetag });
    return res.status(200).json(tag);
  } catch (e:any) {
    throw new AppError(`${e.message}`)
  }

}



export const remove = async (
  req: Request, res: Response
) => {
  const { tagId } = req.params;

  try {
    const tag = await DeleteTagService({ tagId });
    return res.status(200).json({ message: "Tag deleted" });;
  } catch (e) {
    throw new AppError(`${e}`)
  }

}



export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tagData: Tag = req.body;
  

  const { tagId } = req.params;

  const tag = await UpdateTagService({ tagData, tagId });

 

  return res.status(200).json({ message: "Tag uptaded" });
};

