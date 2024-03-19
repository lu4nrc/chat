import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

import Tag from "../../models/Tag";

interface Request {
    tagId: string;
}
const DeleteTagService = async ({
    tagId
}: Request): Promise<void> => {
    const tag = await Tag.findOne({
        where: { id: tagId }
    });
    if (tag) {
        await Contact.findAll().then((contacts) => {
            contacts.map(async (contact) => {
                if (contact.tagslist.some(item => item.id === tag.id)) {
                    contact.tagslist.splice(contact.tagslist.findIndex(v => v.id === tag.id), 1);
                    await contact.update({
                        tagslist: [...contact.tagslist]
                    })
                }
            })
        })
    }
    if (!tag) {
        throw new AppError("ERR_NO_TAG_FOUND", 404);
    }
    await tag.destroy();
};

export default DeleteTagService;
