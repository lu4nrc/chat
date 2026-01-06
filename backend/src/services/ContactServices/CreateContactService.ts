import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import Tag from "../../models/Tag";

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
  try {
    const [contact, created] = await Contact.findOrCreate({
      where: { number },
      defaults: {
        name,
        number,
        email
      }
    });

    // 👉 Só cria associações se o contato for novo
    if (created) {
      if (extraInfo.length) {
        await ContactCustomField.bulkCreate(
          extraInfo.map(info => ({
            ...info,
            contactId: contact.id
          }))
        );
      }

      if (tagslist.length) {
        await contact.$set("tagslist", tagslist);
      }
    }

    return contact;
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const contact = await Contact.findOne({ where: { number } });
      if (contact) return contact;
    }

    throw new AppError("ERR_CREATING_CONTACT");
  }
};

export default CreateContactService;
