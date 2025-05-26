/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { UserDto } from '../models/UserDto';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class UsersService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Get current user profile
     * @returns UserDto Current user profile
     * @throws ApiError
     */
    public userControllerGetCurrentUser(): Observable<UserDto> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/api/users/me',
        });
    }
    /**
     * Manually sync current user data from Keycloak
     * @returns UserDto User data synced successfully
     * @throws ApiError
     */
    public userControllerSyncCurrentUser(): Observable<UserDto> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/api/users/sync',
        });
    }
    /**
     * Get user by ID (admin only)
     * @param id
     * @returns UserDto User found
     * @throws ApiError
     */
    public userControllerGetUserById(
        id: string,
    ): Observable<UserDto> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - Admin role required`,
                404: `User not found`,
            },
        });
    }
    /**
     * Get all users (admin only)
     * @returns UserDto List of users
     * @throws ApiError
     */
    public userControllerGetAllUsers(): Observable<Array<UserDto>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/api/users',
            errors: {
                403: `Forbidden - Admin role required`,
            },
        });
    }
}
