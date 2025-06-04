import User from "../../models/User";
import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser"; // Assuming this helper can be used
import { getIO } from "../../libs/socket"; // Import getIO

interface Request {
  userId: number;
  newStatus: string;
}

const ALLOWED_STATUSES = ["online", "offline", "away", "busy"];

const UpdateUserStatusService = async ({ userId, newStatus }: Request): Promise<User | null> => {
  if (!ALLOWED_STATUSES.includes(newStatus)) {
    throw new AppError(`Invalid status: ${newStatus}. Allowed statuses are: ${ALLOWED_STATUSES.join(", ")}`);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  user.status = newStatus;
  await user.save();

  // Optionally, reload to get the latest associations if SerializeUser needs them fresh,
  // but for just status update, it might not be necessary.
  // await user.reload();

  const io = getIO();
  io.emit("user:status:updated", {
    userId: user.id,
    status: user.status // which is newStatus
  });

  return user; // Or return SerializeUser(user) if specific serialization is needed
};

export default UpdateUserStatusService;
