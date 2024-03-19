import { SerializeUser } from "../../helpers/SerializeUser";
import ShowUserService from "./ShowUserService";
interface Request {
  userId: string | number;
  status: string;
  datetime?:Date;
}
interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
  status:string;
}

const UpdateStatusUserService = async ({
  userId,
  status,
  datetime
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId);
  await user.update({
    datetime,
    status
  });
  await user.reload();
  return SerializeUser(user);

};

export default UpdateStatusUserService;
