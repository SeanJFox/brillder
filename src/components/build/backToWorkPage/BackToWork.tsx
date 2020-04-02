import './BackToWork.scss';
import React, { Component } from 'react';
import { Box, Grid, FormControlLabel, Radio, RadioGroup, Button, Checkbox } from '@material-ui/core';
import axios from 'axios';
// @ts-ignore
import { connect } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Dialog from '@material-ui/core/Dialog';

import authActions from 'redux/actions/auth';
import { Brick, BrickStatus } from 'model/brick';
import { User, UserType } from 'model/user';


const mapState = (state: any) => {
  return {
    user: state.user.user,
  }
}

const mapDispatch = (dispatch: any) => {
  return {
    logout: () => dispatch(authActions.logout()),
  }
}

const connector = connect(mapState, mapDispatch);

interface BackToWorkProps {
  user: User,
  history: any;
  logout(): void;
}

interface Filters {
  viewAll: boolean
  buildAll: boolean
  editAll: boolean

  draft: boolean
  review: boolean
  build: boolean
  publish: boolean
}

interface BackToWorkState {
  bricks: Brick[];
  rawBricks: Brick[];
  sortBy: SortBy;
  sortedIndex: number;
  sortedReversed: boolean;
  logoutDialogOpen: boolean;
  deleteDialogOpen: boolean;
  deleteBrickId: number;
  filters: Filters;
}

enum SortBy {
  None,
  Date,
  Popularity,
  Status
}

class BackToWorkPage extends Component<BackToWorkProps, BackToWorkState> {
  constructor(props: BackToWorkProps) {
    super(props)
    this.state = {
      bricks: [],
      rawBricks: [],
      sortBy: SortBy.None,
      sortedIndex: 0,
      sortedReversed: false,
      logoutDialogOpen: false,
      deleteDialogOpen: false,
      deleteBrickId: -1,

      filters: {
        viewAll: true,
        buildAll: false,
        editAll: false,

        draft: false,
        review: false,
        build: false,
        publish: false
      }
    };

    if (this.props.user.type === UserType.Admin) {
      axios.get(process.env.REACT_APP_BACKEND_HOST + '/bricks', {withCredentials: true})
        .then(res => {  
          this.setState({...this.state, bricks: res.data, rawBricks: res.data });
        })
        .catch(error => {
          alert('Can`t get bricks');
        });
    } else {
      axios.get(process.env.REACT_APP_BACKEND_HOST + '/bricks/currentUser', {withCredentials: true})
        .then((res) => { 
          this.setState({...this.state, bricks: res.data, rawBricks: res.data });
        })
        .catch(error => {
          alert('Can`t get bricks')
        });
    }
  }

  logout() {
    this.props.logout();
    this.props.history.push('/choose-user');
  }

  delete() {
    let brickId = this.state.deleteBrickId;
    axios.delete(process.env.REACT_APP_BACKEND_HOST + '/brick/' + brickId, {withCredentials: true})
      .then(res => {
        let {bricks} = this.state;
        let brick = bricks.find(brick => brick.id === brickId);
        if (brick) {
          let index = bricks.indexOf(brick);
          bricks.splice(index, 1);
        }

        this.setState({...this.state, deleteDialogOpen: false});
      })
      .catch(error => {
        alert('Can`t delete bricks');
      });
  }

  move(brickId:number) {
    this.props.history.push(`/build/brick/${brickId}/build/investigation/question`)
  }

  getYear(date: Date) {
    var currentYear =  date.getFullYear();   
    var twoLastDigits = currentYear%100;
    var formatedTwoLastDigits = "";
    
    if (twoLastDigits < 10 ) {
      formatedTwoLastDigits = "0" + twoLastDigits;
    } else {
      formatedTwoLastDigits = "" + twoLastDigits;
    }
    return formatedTwoLastDigits;
  }

  getMonth(date: Date) {
    const month = date.getMonth() + 1;
    var twoLastDigits = month%10;
    var formatedTwoLastDigits = "";

    if (twoLastDigits < 10 ) {
      formatedTwoLastDigits = "0" + twoLastDigits;
    } else {
      formatedTwoLastDigits = "" + twoLastDigits;
    }
    return formatedTwoLastDigits;
  }

  handleSortChange = (e: any) => {
    let sortBy = parseInt(e.target.value) as SortBy;
    const {state} = this;
    let bricks = Object.assign([], state.bricks) as Brick[];
    if (sortBy === SortBy.Date) {
      bricks = bricks.sort((a, b) => {
        const createdA = new Date(a.updated).getTime();
        const createdB = new Date(b.updated).getTime();
        return (createdA > createdB) ? 1 : -1;
      });
    } else if (sortBy === SortBy.Status) {
      bricks = bricks.sort((a, b) => ((a.status > b.status) ? 1 : -1));
    } else if (sortBy === SortBy.Popularity) {
      bricks = bricks.sort((a, b) => ((a.attemptsCount > b.attemptsCount) ? 1 : -1));
    }
    this.setState({...state, bricks, sortBy})
  }

  changeSortedBricks = () => {
    let reversed = this.state.sortedReversed;
    let preReversed = reversed;
    let index = this.state.sortedIndex;
    if (index + 36 >= this.state.bricks.length) {
      preReversed = true;
    }
    if (reversed === false) {
      this.setState({...this.state, sortedIndex: index + 18, sortedReversed: preReversed});
    } else {
      if (index <= 18) {
        preReversed = false;
      }
      this.setState({...this.state, sortedIndex: index - 18, sortedReversed: preReversed});
    }
  }

  handleMouseHover(index: number) {
    let {bricks} = this.state;
    bricks.forEach(brick => {
      brick.expanded = false;
    });
    this.setState({...this.state});
    setTimeout(() => {
      let {bricks} = this.state;
      bricks.forEach(brick => {
        brick.expanded = false;
      });
      if (!bricks[index].expandFinished) {
        bricks[index].expanded = true;
      }
      this.setState({...this.state});
    }, 400);
  }

  handleMouseLeave(key: number) {
    let {bricks} = this.state;
    bricks.forEach(brick => {
      brick.expanded = false;
    });
    bricks[key].expandFinished = true;
    this.setState({...this.state});
    setTimeout(() => {
      bricks[key].expandFinished = false;
      this.setState({...this.state});
    }, 400);
  }

  getAuthorRow(brick: Brick) {
    let row = "";
    const created = new Date(brick.created);
    const year = this.getYear(created);
    const month = this.getMonth(created);
    if (brick.author) {
      const {author} = brick;
      if (author.firstName || author.firstName) {
        row += `${author.firstName} ${author.firstName} | `
      }
      row += `${created.getDate()}.${month}.${year} | ${brick.brickLength} mins`;
    }
    return row;
  }

  handleLogoutOpen() {
    this.setState({...this.state, logoutDialogOpen: true})
  }

  handleLogoutClose() {
    this.setState({...this.state, logoutDialogOpen: false})
  }

  handleDeleteOpen(deleteBrickId: number) {
    this.setState({...this.state, deleteDialogOpen: true, deleteBrickId })
  }

  handleDeleteClose() {
    this.setState({...this.state, deleteDialogOpen: false})
  }

  getSortedBrickContainer = (brick: Brick, key: number, row: any = 0) => {
    let color = "";
    if (brick.status === BrickStatus.Draft) {
      color = "color1";
    } else if (brick.status === BrickStatus.Review) {
      color = "color2";
    } else if (brick.status === BrickStatus.Build) {
      color = "color3";
    } else if (brick.status === BrickStatus.Publish) {
      color = "color4";
    }
    return (
      <Grid container key={key} item xs={4} justify="center">
        <div className="main-brick-container">
          <Box
            className={`brick-container ${color}`}
            onMouseEnter={() => this.handleMouseHover(key)}
            onMouseLeave={() => this.handleMouseLeave(key)}
          >
            <div className={`sorted-brick absolute-container brick-row-${row} ${brick.expanded ? 'brick-hover' : ''}`}>
            <Grid container direction="row" style={{padding: 0, position: 'relative'}}>
              <Grid item xs={brick.expanded ? 12 : 11}>
                <div className="link-description">{brick.title}</div>
                <div className="link-info">{brick.subTopic} | {brick.alternativeTopics}</div>
                <div className="link-info">
                  {this.getAuthorRow(brick)}
                </div>
                {
                  brick.expanded ?
                    <div>
                      <div className="hover-text">
                        <div className="hovered-open-question">{brick.openQuestion}</div>
                        <div>SUBJECT Code | No. {brick.attemptsCount} of Plays</div>
                        <div>Editor: Name Surname</div>
                      </div>
                      <Grid container direction="row" className="hover-icons-row" alignContent="flex-end">
                        <Grid item xs={6} container justify="flex-start">
                          {
                            (this.props.user.type === UserType.Admin)
                              ? <img alt="bin" onClick={() => this.handleDeleteOpen(brick.id)} className="bin-button" src="/images/brick-list/bin.png" />
                              : ""
                          }
                        </Grid>
                        <Grid item xs={6} container justify="flex-end">
                          <img
                            alt="play"
                            className="play-button"
                            onClick={() => this.move(brick.id)}
                            src="/images/brick-list/play.png" />
                        </Grid>
                      </Grid>
                    </div>
                    : ""
                }
              </Grid>
              <div className="right-color-column">
                <Grid container alignContent="flex-end" style={{width: '100%', height: '100%'}} justify="center"></Grid>
              </div>
            </Grid>
            </div>
          </Box>
        </div>
      </Grid>
    );
  }

  getEmptyBrickContainer = (key: number, size: any = 3) => {
    return (
      <Grid container key={key} item xs={size} justify="center">
        <div className="main-brick-container">
          <Box className="brick-container">
            <div className="absolute-container empty-container">
              <Grid container direction="row" style={{padding: 0, position: 'relative'}}>
                <Grid item xs={11}></Grid>
                <div className="right-color-column">
                  <Grid container alignContent="flex-end" style={{width: '100%', height: '100%'}} justify="center">
                  </Grid>
                </div>
              </Grid>
            </div>
          </Box>
        </div>
      </Grid>
    );
  }

  removeAllFilters(filters: Filters) {
    filters.viewAll = false;
    filters.buildAll = false;
    filters.editAll = false;
    filters.draft = false;
    filters.build = false;
    filters.review = false;
    filters.publish = false;
  }

  showAll() {
    const {filters} = this.state;
    this.removeAllFilters(filters);
    filters.viewAll = true;
    this.setState({...this.state, filters, bricks: this.state.rawBricks});
  }

  showEditAll() {
    const {filters} = this.state;
    this.removeAllFilters(filters);
    filters.editAll = true;
    let bricks = this.filterByStatus(this.state.rawBricks, BrickStatus.Review)
    bricks.push(...this.filterByStatus(this.state.rawBricks, BrickStatus.Publish))
    this.setState({...this.state, filters, bricks});
  }

  showBuildAll() {
    const {filters} = this.state;
    this.removeAllFilters(filters);
    filters.buildAll = true;
    let bricks = this.filterByStatus(this.state.rawBricks, BrickStatus.Draft)
    this.setState({...this.state, filters, bricks });
  }

  renderIndexesBox = () => {
    let build = 0;
    let edit = 0;
    for (let b of this.state.rawBricks) {
      if (b.status === BrickStatus.Draft) {
        build += 1;
      }
    }

    for (let b of this.state.rawBricks) {
      if (b.status !== BrickStatus.Draft) {
        edit += 1;
      }
    }
    return (
      <div className="indexes-box">
        <div className="sort-header">INBOX</div>
        <div className={"index-box " + ((this.state.filters.viewAll) ? "active" : "")} onClick={() => this.showAll()}>
          View All
          <div className="right-index">{this.state.rawBricks.length}</div>
        </div>
        <div className={"index-box " + ((this.state.filters.buildAll) ? "active" : "")} onClick={() => this.showBuildAll()}>
          Build
          <div className="right-index">{build}</div>
        </div>
        <div className={"index-box " + ((this.state.filters.editAll) ? "active" : "")} onClick={() => this.showEditAll()}>
          Edit
          <div className="right-index">{edit}</div>
        </div>
      </div>
    );
  }

  filterByStatus(bricks: Brick[], status: BrickStatus): Brick[] {
    return bricks.filter(b => b.status === status);
  }

  filterBricks(filters: Filters): Brick[] {
    let filteredBricks:Brick[] = [];
    let bricks = Object.assign([], this.state.rawBricks) as Brick[];
    if (filters.draft) {
      filteredBricks.push(...this.filterByStatus(bricks, BrickStatus.Draft));
    }
    if (filters.build) {
      filteredBricks.push(...this.filterByStatus(bricks, BrickStatus.Build));
    }
    if (filters.review) {
      filteredBricks.push(...this.filterByStatus(bricks, BrickStatus.Review));
    }
    if (filters.publish) {
      filteredBricks.push(...this.filterByStatus(bricks, BrickStatus.Publish));
    }

    if (!filters.draft && !filters.build && !filters.review && !filters.publish) {
      return bricks;
    }
    return filteredBricks;
  }

  removeInboxFilters(filters: Filters) {
    filters.viewAll = false;
    filters.buildAll = false;
    filters.editAll = false;
  }

  toggleDraftFilter() {
    const {filters} = this.state;
    this.removeInboxFilters(filters);
    filters.draft = !filters.draft;
    const bricks = this.filterBricks(filters);
    this.setState({...this.state, filters, bricks });
  }

  toggleBuildFilter() {
    const {filters} = this.state;
    this.removeInboxFilters(filters);
    filters.build = !filters.build;
    const bricks = this.filterBricks(filters);
    this.setState({...this.state, filters, bricks });
  }

  toggleReviewFilter() {
    const {filters} = this.state;
    this.removeInboxFilters(filters);
    filters.review = !filters.review;
    const bricks = this.filterBricks(filters);
    this.setState({...this.state, filters, bricks });
    console.log(filters)
  }

  togglePublishFilter() {
    const {filters} = this.state;
    this.removeInboxFilters(filters);
    filters.publish = !filters.publish;
    const bricks = this.filterBricks(filters);
    this.setState({...this.state, filters, bricks });
  }

  renderSortAndFilterBox = () => {
    let draft = 0;
    let review = 0;
    let build = 0;
    let publish = 0;

    for (let b of this.state.rawBricks) {
      if (b.status === BrickStatus.Draft) {
        draft += 1;
      }
    }

    for (let b of this.state.rawBricks) {
      if (b.status === BrickStatus.Review) {
        review += 1;
      }
    }

    for (let b of this.state.rawBricks) {
      if (b.status === BrickStatus.Build) {
        build += 1;
      }
    }

    for (let b of this.state.rawBricks) {
      if (b.status === BrickStatus.Publish) {
        publish += 1;
      }
    }

    return (
      <div className="back-sort-box">
        <div className="sort-header">Sort By</div>
        <RadioGroup
          className="sort-group"
          aria-label="SortBy"
          name="SortBy"
          value={this.state.sortBy}
          onChange={this.handleSortChange}
        >
          <FormControlLabel value={SortBy.Status} control={<Radio className="sortBy" />} label="Status" />
          <FormControlLabel value={SortBy.Popularity} control={<Radio className="sortBy" />} label="Popularity" />
          <FormControlLabel value={SortBy.Date} control={<Radio className="sortBy" />} label="Last Edit" />
        </RadioGroup>
        <div className="filter-header">Filter</div>
        <div className="filter-container color1">
          <FormControlLabel
            className="filter-radio-label"
            value={this.state.filters.draft}
            control={<Checkbox checked={this.state.filters.draft} className={"filter-radio sort-by"} />}
            onChange={() => this.toggleDraftFilter()}
            label="Draft"
            labelPlacement="end"
          />
          <div className="right-index">{draft}</div>
        </div>
        <div className="filter-container color2">
          <FormControlLabel
            className="filter-radio-label"
            value={this.state.filters.review}
            control={<Checkbox className={"filter-radio sort-by"} />}
            onChange={() => this.toggleReviewFilter()}
            label="Submitted for Review"
            labelPlacement="end"
          />
          <div className="right-index">{review}</div>
        </div>
        <div className="filter-container color3">
          <FormControlLabel
            className="filter-radio-label"
            value={this.state.filters.build}
            control={<Checkbox className={"filter-radio sort-by"} />}
            onChange={() => this.toggleBuildFilter()}
            label="Build in Progress"
            labelPlacement="end"
          />
          <div className="right-index">{build}</div>
        </div>
        <div className="filter-container color4">
          <FormControlLabel
            className="filter-radio-label"
            value={this.state.filters.build}
            control={<Checkbox className={"filter-radio sort-by"} />}
            onChange={() => this.togglePublishFilter()}
            label="Published"
            labelPlacement="end"
          />
          <div className="right-index">{publish}</div>
        </div>
      </div>
    );
  }

  renderSortedBricks = () => {
    let {sortedIndex} = this.state;
    let BackToWork = [];
    for (let i = 0 + sortedIndex; i < 21 + sortedIndex; i++) {
      if (this.state.bricks[i]) {
        let row = Math.floor(i / 3);
        BackToWork.push(this.getSortedBrickContainer(this.state.bricks[i], i, row));
      } else {
        BackToWork.push(this.getEmptyBrickContainer(i, 4));
      }
    }
    return BackToWork
  }

  render() {  
    return (
      <div className="bricks-list-page">
        <div className="bricks-upper-part">
          <Grid container direction="row" className="bricks-header">
            <Grid item style={{width: '7.65vw'}}>
              <Grid container direction="row">
                <Grid item className="home-button-container">
                  <div className="home-button" onClick={() => { this.props.history.push('/build') }}>
                    <div></div>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid container className="logout-container" item direction="row" style={{width: '92.35vw'}}>
              <Grid container style={{width: '60vw', height: '7vh'}}>
              <Grid item>
                <div className="search-button"></div>
              </Grid>
              <Grid item>
                <input className="search-input" placeholder="Search Ongoing Projects & Published Bricks…" />
              </Grid>
              </Grid>
              <Grid item style={{width: '32.35vw'}}>
                <Grid container direction="row" justify="flex-end">
                  <div className="logout-button" onClick={() => this.handleLogoutOpen()}></div>
                  <div className="bell-button"><div></div></div>
                  <div className="user-button"></div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="row" className="sorted-row">
            <Grid container item xs={3} className="sort-and-filter-container">
              <div style={{width: '100%'}}>
                {this.renderIndexesBox()}
                {this.renderSortAndFilterBox()}
              </div>
            </Grid>
            <Grid item xs={9} style={{position: 'relative'}}>
              <Grid container direction="row">
                {this.renderSortedBricks()}
              </Grid>
              {
                this.state.bricks.length > 18 ?
                <Grid container justify="center" className="bottom-next-button">
                  {
                    this.state.sortedReversed
                      ? <ExpandLessIcon onClick={() => this.changeSortedBricks()} />
                      : <ExpandMoreIcon onClick={() => this.changeSortedBricks()} />
                  }
                </Grid>
                : ""
              }
            </Grid>
          </Grid>
        </div>
        <Dialog
          open={this.state.logoutDialogOpen}
          onClose={() => this.handleLogoutClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="alert-dialog"
        >
          <div className="logout-dialog-header">
            <div>Are you sure you want</div>
            <div>to log out?</div>
          </div>
          <Grid container direction="row" className="logout-buttons" justify="center">
            <Button className="yes-button" onClick={() => this.logout()}>Yes</Button>
            <Button className="no-button" onClick={() => this.handleLogoutClose()}>No</Button>
          </Grid>
        </Dialog>
        <Dialog
          open={this.state.deleteDialogOpen}
          onClose={() => this.handleDeleteClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="delete-brick-dialog"
        >
          <div className="dialog-header">
            <div>Permanently delete</div>
            <div>this brick?</div>
          </div>
          <Grid container direction="row" className="row-buttons" justify="center">
            <Button className="yes-button" onClick={() => this.delete()}>Yes, delete</Button>
            <Button className="no-button" onClick={() => this.handleDeleteClose()}>No, keep</Button>
          </Grid>
        </Dialog>
      </div>
    )
  }
}

export default connector(BackToWorkPage);
