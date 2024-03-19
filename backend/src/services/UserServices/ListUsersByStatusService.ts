import { Op } from "sequelize";

import User from "../../models/User";

interface Response {
  users: User[];
  count: number;
}

const ListUsersByStatusService = async (): Promise<Response> => {
 
  const { count, rows: users } = await User.findAndCountAll({
    where: {
      [Op.or]: [
    {status: "active"},
    {status: "lazy"}
      ]
      
    },
    attributes: ["name", "id", "email", "profile", "createdAt","updatedAt","datetime"],
    order: [["createdAt", "DESC"]],
  });

  return {
    users,
    count,
  };
};

export default ListUsersByStatusService;
