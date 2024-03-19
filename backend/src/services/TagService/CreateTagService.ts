import AppError from "../../errors/AppError";

import Tag from "../../models/Tag";

interface Request {
  
  name: string;
  value: string;
  typetag: string;

}

const CreateTagService = async ({
  name,
  value,
  typetag,

}: Request): Promise<Tag> => {
  const odlTag = await Tag.findOne({
    where:{name,typetag}
  })
  if(odlTag){
    throw new AppError("Tag com mesmo nome já cadastrada!");
  }
  const tag = await Tag.create({
    name,
    value,
    typetag,
  })
  if (!tag) {
    throw new AppError("ERR_CREATING_TAG");
  }

  return tag;
};

export default CreateTagService;
