import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    DataType
  } from "sequelize-typescript";

  import Contact from "./Contact";
  
  @Table
  class Tag extends Model<Tag> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;
  
    @Column
    value: string;

    @Column
    typetag: string;
  
  
    // @ForeignKey(() => Contact)
    // @Column
    // contactId: number;
  
    // @BelongsTo(() => Contact)
    // contact: Contact;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Tag;
  