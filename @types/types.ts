
export namespace ChatTypes {

    export enum Status {
        online = 'online',
        offline = 'offline'
    }

    export enum RelationshipStatus {
        mute = 'muted',
        block = 'blocked',
        normal = 'normal'
    }

    export interface User {
        id: string;
        userName: string;
        password: string;
        createdAt: Date;
        profile: number;
        chats: number[];
    }

    export interface Profile {
        id: number;
        fullName: string;
        birthday: Date;
        bio: string;
        status: Status;
    }

    export interface Message{
        id: number;
        content: string;
        type: "Text" | "Attachment";
        timeSent: Date;
        sender: string;
        chat_id: number;
    }

    export interface Chat{
        id: number;
        name: string;
        description: string;
        type: "1To1" | "group";
        createdAt: Date;
        participants: User[];
        messages: Message[];
    }

  
}


