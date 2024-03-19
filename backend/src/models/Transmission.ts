import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType
  } from "sequelize-typescript";
  
  @Table
  class Transmission extends Model<Transmission> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @Column
    name: string;
  
    @Column(DataType.ARRAY(DataType.JSONB))
    contacts: Array<{ name: string, number: string,email: string,isGroup:boolean,id:number}>;

    @Column(DataType.ARRAY(DataType.JSONB))
    messages: Array<{ type: string, value: string,date: Date }>;
  
    @CreatedAt
    createdAt: Date;
  
    @UpdatedAt
    updatedAt: Date;
  }
  
  export default Transmission;
  