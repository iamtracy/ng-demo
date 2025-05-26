/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserDto = {
    /**
     * When the record was created
     */
    createdAt: string;
    /**
     * When the record was last updated
     */
    updatedAt: string;
    /**
     * The unique identifier of the user (Keycloak sub)
     */
    id: string;
    /**
     * The email address of the user
     */
    email: string;
    /**
     * The username of the user
     */
    username: string;
    /**
     * The first name of the user
     */
    firstName?: string;
    /**
     * The last name of the user
     */
    lastName?: string;
    /**
     * Whether the user email is verified
     */
    emailVerified: boolean;
    /**
     * User roles from Keycloak
     */
    roles: Array<string>;
    /**
     * When the user last logged in
     */
    lastLoginAt?: string;
};

