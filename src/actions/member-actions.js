/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";


export const AFFILIATION_SAVED        = 'AFFILIATION_SAVED';
export const AFFILIATION_DELETED      = 'AFFILIATION_DELETED';
export const AFFILIATION_ADDED        = 'AFFILIATION_ADDED';

export const addAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'organization'
    };

    let normalizedEntity = normalizeEntity(affiliation);

    postRequest(
        null,
        createAction(AFFILIATION_ADDED),
        `${window.API_BASE_URL}/api/v1/members/me/affiliations`,
        normalizedEntity,
        authErrorHandler,
        affiliation
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    });

}

export const saveAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());


    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(affiliation);

    putRequest(
        null,
        createAction(AFFILIATION_SAVED)({affiliation}),
        `${window.API_BASE_URL}/api/v1/members/me/affiliations/${affiliation.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
    });

}

export const deleteAffiliation = (ownerId, affiliationId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(AFFILIATION_DELETED)({affiliationId}),
        `${window.API_BASE_URL}/api/v1/members/me/affiliations/${affiliationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (!normalizedEntity.end_date) delete(normalizedEntity['end_date']);

    normalizedEntity.organization_name = (normalizedEntity.organization != null) ? normalizedEntity.organization.name : '';
    delete(normalizedEntity['organization']);

    return normalizedEntity;

}
