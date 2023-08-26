import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class User {

    _id?: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password?: string;

    @Prop({ minlength: 6, required: true })
    name: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['User'] }) // ['admin', 'user']
    roles: string[];

}


export const UserSchema = SchemaFactory.createForClass(User);
