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

import { authErrorHandler, apiBaseUrl} from './base-actions';
import T from "i18n-react/dist/i18n-react";
import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage
} from "openstack-uicore-foundation/lib/methods";

export const CREATED_RECEIVED       = 'CREATED_RECEIVED';
export const SPEAKER_RECEIVED       = 'SPEAKER_RECEIVED';
export const MODERATOR_RECEIVED     = 'MODERATOR_RECEIVED';


export const getAllPresentations = () => (dispatch, getState) => {

    let { loggedUserState, selectionPlanState } = getState();
    let { accessToken } = loggedUserState;
    let selectionPlanId = selectionPlanState.id;

    let params = {
        access_token : accessToken
    };

    dispatch(startLoading());

    let created = getRequest(
        null,
        createAction(CREATED_RECEIVED),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/creator/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch);

    let speaker = getRequest(
        null,
        createAction(SPEAKER_RECEIVED),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/speaker/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch);

    let moderator = getRequest(
        null,
        createAction(MODERATOR_RECEIVED),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/moderator/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch);


    Promise.all([created, speaker, moderator]).then(() => {
            dispatch(stopLoading());
        }
    );
};
