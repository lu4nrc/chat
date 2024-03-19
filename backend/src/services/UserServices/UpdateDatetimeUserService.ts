import ShowUserService from "./ShowUserService";
interface Request {
  userId: string | number;
}

const UpdateDatetimeUserService = async ({
  userId,
}: Request): Promise<any | undefined> => {
  const user = await ShowUserService(userId);
  await user.update({
    datetime:new Date(),
  });
 
};

export default UpdateDatetimeUserService;
