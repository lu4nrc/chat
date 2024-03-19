import ShowUserService from "./ShowUserService";
interface Request {
  imageUrl: string;
  userId: string | number;
}

const UpdateProfileImageService = async ({
  imageUrl,
  userId,
}: Request): Promise<any | undefined> => {
  const user = await ShowUserService(userId);
  await user.update({
    imageUrl
  });
};

export default UpdateProfileImageService;
