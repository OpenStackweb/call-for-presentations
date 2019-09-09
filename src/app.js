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

import React from 'react'
import { Switch, Route, Router } from 'react-router-dom'
import moment from 'moment-timezone';
import PrimaryLayout from "./layouts/primary-layout"
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import AuthButton from './components/auth-button'
import DefaultRoute from './routes/default-route'
import LogOutCallbackRoute from './routes/logout-callback-route'
import { connect } from 'react-redux'
import { AjaxLoader, OPSessionChecker } from "openstack-uicore-foundation/lib/components";
import {getBackURL, formatEpoch, doLogout, initLogOut, doLogin, getUserInfo, onUserAuth} from "openstack-uicore-foundation/lib/methods";
import T from 'i18n-react';
import history from './history'
import CustomErrorPage from "./pages/custom-error-page";
import {getCurrentSelectionPlanPublic, getCurrentSummitPublic, resetLoading} from './actions/base-actions';
import LandingPage from "./pages/landing-page";
import LanguageSelect from "./components/language-select";
import exclusiveSections from 'js-yaml-loader!./exclusive-sections.yml';


// here is set by default user lang as en

let language = localStorage.getItem('PREFERRED_LANGUAGE');

if (!language) {
    language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

    // language would be something like es-ES or es_ES
    // However we store our files with format es.json or en.json therefore retrieve only the first 2 digits

    if (language.length > 2) {
        language = language.split("-")[0];
        language = language.split("_")[0];
    }
}

try {
    T.setTexts(require(`./i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`./i18n/en.json`));
}


// move all env var to global scope so ui core has access to this

window.IDP_BASE_URL        = process.env['IDP_BASE_URL'];
window.API_BASE_URL        = process.env['API_BASE_URL'];
window.OAUTH2_CLIENT_ID    = process.env['OAUTH2_CLIENT_ID'];
window.SCOPES              = process.env['SCOPES'];
window.APP_CLIENT_NAME     = process.env['APP_CLIENT_NAME'];
window.ALLOWED_USER_GROUPS = "";
window.EXCLUSIVE_SECTIONS  = [];

if (exclusiveSections.hasOwnProperty(window.APP_CLIENT_NAME)) {
    window.EXCLUSIVE_SECTIONS = exclusiveSections[window.APP_CLIENT_NAME];
}

class App extends React.PureComponent {

    componentWillMount() {
        this.props.resetLoading();
        this.props.getCurrentSummitPublic();
        this.props.getCurrentSelectionPlanPublic();
    }

    onClickLogin(){
        doLogin(getBackURL());
    }

    render() {
        let { isLoggedUser, onUserAuth, doLogout, getUserInfo, member, speaker, backUrl, loading, publicSelectionPlan, publicSummit} = this.props;
        let profile_pic = speaker ? speaker.member.pic : (member ? member.pic : '');

        let header_title = '';
        let header_subtitle = '';
        let summit_logo = 'https://object-storage-ca-ymq-1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/Uploads/arrows.svg';

        if(publicSummit) {
            summit_logo = (publicSummit.logo) ? publicSummit.logo : summit_logo;

            if (publicSelectionPlan) {
                let end_date = formatEpoch(publicSelectionPlan.submission_end_date, 'MMM Do h:mm a');
                header_title = `: ${publicSelectionPlan.name} ${publicSummit.name}`;
                header_subtitle = `Accepting submissions until ${end_date} (${moment.tz.guess()})`;
            } else {
                header_title = `: ${publicSummit.name}`;
                header_subtitle = `SUBMISSION IS CLOSED`;
            }
        }

        return (
            <Router history={history}>
                <div>
                    <AjaxLoader show={ loading } size={ 120 }/>
                    {isLoggedUser &&
                    <OPSessionChecker
                        clientId={window.OAUTH2_CLIENT_ID}
                        idpBaseUrl={window.IDP_BASE_URL}
                    />
                    }
                    <div className="header">
                        <div className="header-title row">
                            <div className="col-md-3 col-xs-6 text-left">
                                <img className="header-logo" src={summit_logo} />
                            </div>
                            <div className="col-md-3 col-md-push-6 col-xs-6">
                                <LanguageSelect language={language} />
                                <AuthButton isLoggedUser={isLoggedUser} picture={profile_pic} initLogOut={initLogOut}/>
                            </div>
                            <div className="col-md-6 col-md-pull-3 col-xs-12 title">
                                <span>{T.translate("landing.call_for_presentations")} {header_title}</span>
                                <br/>
                                <span className="subtitle"> {header_subtitle} </span>
                            </div>
                        </div>
                    </div>


                    <React.Fragment>
                        {!isLoggedUser &&
                            <LandingPage doLogin={this.onClickLogin.bind(this)} summit={publicSummit}/>
                        }
                        <Switch>
                            <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/auth/callback' getUserInfo={getUserInfo} />
                            <Route path="/error" component={CustomErrorPage}/>
                            <AuthorizedRoute isLoggedUser={isLoggedUser} backUrl={backUrl} path="/app" component={PrimaryLayout} />
                            <Route path="/404" render={props => (<p>404 - Not Found</p>)}/>
                            <LogOutCallbackRoute path='/auth/logout' doLogout={doLogout} />
                            <DefaultRoute isLoggedUser={isLoggedUser} />
                        </Switch>
                    </React.Fragment>

                </div>
            </Router>
        );
    }
}

const mapStateToProps = ({ loggedUserState, baseState, landingState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    member: loggedUserState.member,
    speaker: baseState.speaker,
    loading : baseState.loading,
    publicSummit: landingState.summit,
    publicSelectionPlan: landingState.selectionPlan
})

export default connect(mapStateToProps, {
    onUserAuth,
    doLogout,
    getUserInfo,
    resetLoading,
    getCurrentSummitPublic,
    getCurrentSelectionPlanPublic
})(App)
