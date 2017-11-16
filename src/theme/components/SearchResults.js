/*
    author: Alexander Zolotov
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { instanceOf } from 'prop-types';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import JobsList from '~/src/components/containers/JobsList';
import EventBriteItemList from '~/src/components/containers/EventBriteItemList';
import UdemyItemList from '~/src/components/containers/UdemyItemList';
import FreelancerProjectItemList from '~/src/components/containers/FreelancerProjectItemList';

import ResultCategory from '~/src/common/ResultCategoryNames'

import { withCookies, Cookies } from 'react-cookie';

import ConfigMain from '~/configs/main'

import DetailsPopup from '~/src/components/common/DetailsPopup';

import "~/src/css/searchResults.css"

import {openSearchResultsComplete} from '~/src/redux/actions/fetchResults'
import {bookmarkAdd, bookmarksSet} from '~/src/redux/actions/bookmarks'

class SearchResults extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isDetailsPopupOpen: false,
      detailsPopupItem: {},
    };
  }
  componentWillMount() {
    const savedBookmarks = this.props.cookies.get('bookmarks');
    
    if (savedBookmarks && savedBookmarks.length > 0) {
        if (this.props.bookmarks.length == 0) {
          this.props.setBookmarks(savedBookmarks);
        }
    }

    this.props.openSearchResultsComplete();
  }


  componentDidUpdate(prevProps, prevState) {
    if (prevProps.bookmarks.length != this.props.bookmarks.length) {
      const { cookies } = this.props;

      const savedBookmarks = cookies.get('bookmarks');

      //only add bookmarks to cookies if they differ in length or not set yet
      if (!savedBookmarks || savedBookmarks.length != this.props.bookmarks.length) {
          let dateExpire = new Date();
          dateExpire.setTime(dateExpire.getTime() + ConfigMain.getCookiesExpirationPeriod());  
          
          let options = { path: '/', expires: dateExpire};
          
          cookies.set('bookmarks', this.props.bookmarks, options); //will expire in 'lifetimeMinutes' minutes
      }
    }
}

  handleOpenDetailsPopup(item) {
    console.log("handleOpenDetailsPopup");
    console.dir(item);
    let copy = Object.assign({}, this.state, {isDetailsPopupOpen: true, detailsPopupItem: item});
    this.setState(copy)
  }

  handleCloseDetailsPopup(item) {
    console.log("handleCloseDetailsPopup");
    let copy = Object.assign({}, this.state, {isDetailsPopupOpen: false, detailsPopupItem: {}});
    this.setState(copy)
  }

  render() {
    const jobsList = (this.props.resultsSelectedCategory == ResultCategory.JOBS_INDEED) 
    ? <JobsList items={this.props.searchResults.jobs} onAddBookmark={(item) => this.handleOpenDetailsPopup(item)}/> : null;
    
    const eventsList = (this.props.resultsSelectedCategory == ResultCategory.EVENTS_EVENTBRITE)
    ? <EventBriteItemList items={this.props.searchResults.events} onAddBookmark={(item) => this.handleOpenDetailsPopup(item)}/> : null;
    
    const udemyCoursesList = (this.props.resultsSelectedCategory == ResultCategory.COURSES_UDEMY)
    ? <UdemyItemList items={this.props.searchResults.courses} onAddBookmark={(item) => this.props.addBookmark(item)}/> : null;
    
    const freelancerProjectList = (this.props.resultsSelectedCategory == ResultCategory.GIGS_FREELANCER)
    ? <FreelancerProjectItemList items={this.props.searchResults.gigs} 
        onAddBookmark={(item) => this.props.addBookmark(item)}/> : null;

    if(this.props.isFetchInProgress) {
      return <div className="search_results_container"><h2>Searching...</h2></div>;
    }
    else {
      return (
        <div className="search_results_container">
          {this.state.isDetailsPopupOpen ? <DetailsPopup modalIsOpen={this.state.isDetailsPopupOpen} 
            onCloseModal={()=>this.handleCloseDetailsPopup()} 
              item={this.state.detailsPopupItem} addBookMark={(item)=>this.props.addBookmark(item)}/> : null}
          <div className="row">
            <div className="col-lg-12">
              {jobsList}    
              {eventsList}
              {udemyCoursesList}
              {freelancerProjectList}
            </div>
          </div>
        </div>
      );
    }
  }

}

SearchResults.propTypes = {
  resultsSelectedCategory: PropTypes.string.isRequired,
  searchResults: PropTypes.object.isRequired,
  isFetchInProgress: PropTypes.bool.isRequired,
  bookmarks: PropTypes.arrayOf(PropTypes.object).isRequired,
  cookies: instanceOf(Cookies).isRequired,

  openSearchResultsComplete: PropTypes.func.isRequired,
  addBookmark: PropTypes.func.isRequired,
  setBookmarks: PropTypes.func.isRequired,
}
  
const mapStateToProps = state => ({
  resultsSelectedCategory: state.resultsSelectedCategory,
  searchResults : state.searchResults,
  isFetchInProgress : state.isFetchInProgress,
  bookmarks : state.bookmarks.bookmarks,
})

const mapDispatchToProps = dispatch => ({
  openSearchResultsComplete: bindActionCreators(openSearchResultsComplete, dispatch),
  addBookmark: bindActionCreators(bookmarkAdd, dispatch),
  setBookmarks: bindActionCreators(bookmarksSet, dispatch),
})

  
//withRouter - is a workaround for problem of shouldComponentUpdate when using react-router-v4 with redux
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withCookies(SearchResults)));