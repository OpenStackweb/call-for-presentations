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

import React from 'react';
import {connect} from 'react-redux';
import history from "../history";
import SelectionPlanSection from "../components/selection-plan-section";

const AllSelectionPlansPage = ({summit, loggedSpeaker, loading, match}) => {

  const getAvailablePlans = () => {
    const selectionPlanIdParam = parseInt(match?.params?.selection_plan_id) || null;
    let allPlans = [];

    if (selectionPlanIdParam) {
      allPlans = summit.selection_plans.filter(sp => sp.id === selectionPlanIdParam);
    } else {
      allPlans = summit.selection_plans.filter(sp => sp.is_enabled);
    }

    return allPlans.sort((a,b) => a.submission_begin_date - b.submission_begin_date);
  };

  if (summit == null || loggedSpeaker == null) return null;

  if (!loggedSpeaker) {
    history.push(`/app/profile`);
    return;
  }

  const plansToShow = getAvailablePlans();

  return (
    <div>
      {plansToShow.map(sp => <SelectionPlanSection key={`selection-plan-section-${sp.id}`} selectionPlan={sp} history={history} match={match} />)}
    </div>
  );
};

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
});

export default connect(mapStateToProps)(AllSelectionPlansPage);
