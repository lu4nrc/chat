
import Tag from "../../models/Tag";

interface Response {
  tags: Tag[];

}

const ListTagService = async (): Promise<Response> => {
  
  const { count, rows: tags } = await Tag.findAndCountAll({
    order: [["updatedAt", "DESC"]]
  });

  

  return {
    tags
    
  };
};

export default ListTagService;
