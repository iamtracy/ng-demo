/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MessageDto = {
    /**
     * When the record was created
     */
    createdAt: string;
    /**
     * When the record was last updated
     */
    updatedAt: string;
    /**
     * The unique identifier of the message
     */
    id: number;
    /**
     * The content of the message
     */
    message: string;
    /**
     * The ID of the user who created the message
     */
    userId: string;
    /**
     * The username of the message author (only for admin users)
     */
    username?: string;
    /**
     * The first name of the message author (only for admin users)
     */
    firstName?: string;
    /**
     * The last name of the message author (only for admin users)
     */
    lastName?: string;
};

