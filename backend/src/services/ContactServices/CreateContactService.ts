import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import Tag from "../../models/Tag";



// interface ExtraInfo {
//   name: string;
//   value: string;
// }
// interface TagInterface {
//   id?: number;
//   name: string;
//   value: string;
//   typetag?: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ContactCustomField[] | any[];
  tagslist?: Tag[] | any[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  extraInfo = [],
  tagslist = []
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      extraInfo,
      tagslist
    },
    {
      include: ["extraInfo"],

    }
  );
  return contact;
};

export default CreateContactService;
