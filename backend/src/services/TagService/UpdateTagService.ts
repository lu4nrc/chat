import AppError from "../../errors/AppError";

import Tag from "../../models/Tag";
interface TagData {
    id: number;
    name: string;
    value: string;
    typetag: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Request {
    tagId: string;
    tagData: TagData;
}

const UpdateTagService = async ({
    tagData,
    tagId,

}: Request): Promise<void> => {
    const odlTag = await Tag.findOne({
        where: { name: tagData.name, typetag: tagData.typetag }
    })
    if (odlTag) {
        throw new AppError("Tag com mesmo nome já cadastrada!");
    }
    const tag = await Tag.findOne({
        where: { id: tagId }
    });

    if (!tag) {
        throw new AppError("ERR_NO_TAG_FOUND", 404);
    }

    await tag.update(tagData);
};

export default UpdateTagService;
