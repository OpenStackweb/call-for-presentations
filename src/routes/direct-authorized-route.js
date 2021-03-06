/**
 * Copyright 2020 OpenStack Foundation
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

import React from 'react'
import { Route} from 'react-router-dom'

import {
    doLogin,
} from "openstack-uicore-foundation/lib/methods";

class DirectAuthorizedRoute extends React.Component {

    componentDidMount() {
        const { isLoggedUser} = this.props;
        if(!isLoggedUser)
            doLogin('/app/profile');
    }

    render() {
        const { component: Component, isLoggedUser, ...rest } = this.props;
        return (
            <Route {...rest} render={props => {
                let { location } = this.props;
                let backUrl = location.pathname;
                let summit_slug = this.props.computedMatch.params.summit_slug;
                if(location.search != null){
                    backUrl += location.search
                }

                if(location.hash != null){
                    backUrl += location.hash
                }
                return isLoggedUser
                    ? <Component {...props} />
                    : null;
            }} />
        )
    }
}

export default DirectAuthorizedRoute;


