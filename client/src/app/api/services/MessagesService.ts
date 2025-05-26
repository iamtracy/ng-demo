/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CreateMessageDto } from '../models/CreateMessageDto';
import type { MessageDto } from '../models/MessageDto';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Get messages - all messages for admins, own messages for users
     * @returns MessageDto List of messages
     * @throws ApiError
     */
    public messageControllerFindAll(): Observable<Array<MessageDto>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/api/messages',
        });
    }
    /**
     * Create a new message
     * @param requestBody
     * @returns MessageDto The message has been successfully created.
     * @throws ApiError
     */
    public messageControllerCreate(
        requestBody: CreateMessageDto,
    ): Observable<MessageDto> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/api/messages',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a message
     * @param id
     * @param requestBody
     * @returns MessageDto The message has been successfully updated.
     * @throws ApiError
     */
    public messageControllerUpdate(
        id: number,
        requestBody: CreateMessageDto,
    ): Observable<MessageDto> {
        return __request(OpenAPI, this.http, {
            method: 'PUT',
            url: '/api/messages/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden. You can only update your own messages.`,
                404: `Message not found.`,
            },
        });
    }
    /**
     * Delete a message
     * @param id
     * @returns any The message has been successfully deleted.
     * @throws ApiError
     */
    public messageControllerDelete(
        id: number,
    ): Observable<{
        /**
         * ID of the deleted message
         */
        id?: number;
    }> {
        return __request(OpenAPI, this.http, {
            method: 'DELETE',
            url: '/api/messages/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden. You can only delete your own messages.`,
                404: `Message not found.`,
            },
        });
    }
}
