import Axios from 'axios'

import {
    OPEN_USER_PROFILE, 
    OPEN_USER_PROFILE_COMPLETE,
    FETCH_USER_PROFILE_INITIATE,
    FETCH_USER_PROFILE_COMPLETE,
    FETCH_USER_PROFILE_TASKS_INITIATE,
    FETCH_USER_PROFILE_TASKS_COMPLETE,

    SIGNUP_FORM_OPEN,
    SIGNUP_FORM_CLOSE,

} from './actionTypes';

import ConfigMain from '~/configs/main'

export function openSignUpForm() {
    return {
        type: SIGNUP_FORM_OPEN,
    }
}

export function closeSignUpForm() {
    return {
        type: SIGNUP_FORM_CLOSE,
    }
}

export function openUserProfile() {
    return {
        type: OPEN_USER_PROFILE,
    }
}

export function openUserProfileComplete() {
    return {
        type: OPEN_USER_PROFILE_COMPLETE,
    }
}

export function fetchUserProfileComplete(userProfile) {
    return {
        type: FETCH_USER_PROFILE_COMPLETE,
        profile: userProfile
    }
}

export function fetchUserProfileInitiate() {
    return {
        type: FETCH_USER_PROFILE_INITIATE,
        profile: {}
    }
}

export function fetchUserProfileTasksInitiate() {
    return {
        type: FETCH_USER_PROFILE_TASKS_INITIATE,
    }
}

export function fetchUserProfileTasksComplete(assignedTasks, createdTasks) {
    return {
        type: FETCH_USER_PROFILE_TASKS_COMPLETE,
        tasksAssigned: assignedTasks,
        tasksCreated: createdTasks,
    }
}

export function fetchUserTasks(userId) {
    
    return function (dispatch) {

        dispatch(fetchUserProfileTasksInitiate());

        const url = `${ConfigMain.getBackendURL()}/tasksGetForUser?userId=${userId}&assigneeId=${userId}`;
    
        return (
          Axios.get(url)
            .then(function(response) {

                let tasksAssigned = [];
                let tasksCreated = [];

                for (let i = 0; i < response.data.length; ++i) {
                    if (response.data[i].userID == userId) {
                        tasksCreated.push(response.data[i]);
                    }
                    else if (response.data[i].assignee && response.data[i].assignee._id == userId) {
                        tasksAssigned.push(response.data[i]);
                    }
                }

                dispatch(fetchUserProfileTasksComplete(tasksAssigned, tasksCreated));
            })
            .catch(function(error) {
                dispatch(fetchUserProfileTasksComplete([], []));
            }));
    }
}

export function fetchUserProfile(userIdFacebook, userIdLinkedIn) {

    return function (dispatch) {
  
        //async action entry point
      dispatch(fetchUserProfileInitiate());

      const url = userIdFacebook ? `${ConfigMain.getBackendURL()}/fetchUserProfile?faceBookID=${userIdFacebook}`
      : `${ConfigMain.getBackendURL()}/fetchUserProfile?linkedInID=${userIdLinkedIn}`;

      return (
        Axios.get(url)
        .then(function(response) {
            const responseProfile = response.data.profile;
            let newUserProfile = {
              _id: response.data._id,
              firstName: responseProfile.firstName, 
              lastName: responseProfile.lastName, 
              interests: responseProfile.interests, //TODO: receive FaceBook advanced permissions
              skills: responseProfile.skills, //TODO: receive FaceBook advanced permissions
              experience: responseProfile.experience,
              education: responseProfile.education,
              roadmaps: response.data.roadmaps,
              progressionTrees: response.data.progressionTrees,
              balance:responseProfile.balance
            }

            //async action exit point
            dispatch(fetchUserProfileComplete(newUserProfile));
        })
        .catch(function(error) {
            //async action exit point
            dispatch(fetchUserProfileComplete({}));
        }));
    }
}