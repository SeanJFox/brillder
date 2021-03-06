
import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Grid } from '@material-ui/core';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import './PairMatch.scss';
import CompComponent from '../Comp';
import {CompQuestionProps} from '../types';
import {ComponentAttempt} from 'components/play/brick/model/model';
import ReviewGlobalHint from '../../baseComponents/ReviewGlobalHint';
import DenimCrossRect from 'components/play/components/DenimCrossRect';
import DenimTickRect from 'components/play/components/DenimTickRect';
import {QuestionValueType} from 'components/build/investigationBuildPage/buildQuestions/questionTypes/types';
import {Answer} from 'components/build/investigationBuildPage/buildQuestions/questionTypes/pairMatchBuild/types';


interface PairMatchChoice {
  value: string;
  index: number;
  hint: string;
  option: string;
}

interface PairMatchComponent {
  type: number;
  list: PairMatchChoice[];
  choices: any[];
  options: any[];
}

interface PairMatchProps extends CompQuestionProps {
  component: PairMatchComponent;
  answers: number;
}

interface PairMatchState {
  userAnswers: any[];
}

class PairMatch extends CompComponent<PairMatchProps, PairMatchState> {
  constructor(props: PairMatchProps) {
    super(props);

    const {component} = props;
    if (props.isPreview === true) {
      this.state = {
        userAnswers: component.list ? component.list : [],
      };
    } else {
      this.state = {
        userAnswers: component.choices ? component.choices : [],
      };
    }
  }

  componentWillUpdate(props: PairMatchProps) {
    if (props.isPreview === true && props.component) {
      if (this.state.userAnswers !== props.component.list) {
        this.setState({userAnswers: props.component.list});
      }
    }
  }

  setUserAnswers(userAnswers: any[]) {
    this.setState({ userAnswers });
  }

  getAnswer(): any[] {
    return this.state.userAnswers;
  }

  getState(entry: number): number {
    if (this.props.attempt?.answer[entry]) {
      if (this.props.attempt.answer[entry].toLowerCase().replace(/ /g, '') === this.props.component.list[entry].value.toLowerCase().replace(/ /g, '')) {
        return 1;
      } else { return -1; }
    } else { return 0; }
  }

  mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
    let markIncrement = prev ? 2 : 5;
    attempt.correct = true;
    attempt.marks = 0;
    attempt.maxMarks = 0;
    attempt.answer.forEach((answer: any, index: number, array: any[]) => {
      attempt.maxMarks += 5;
      if(answer.index === this.props.component.list[index].index) {
        if(!prev) {
          attempt.marks += markIncrement;
        } else if (prev.answer[index].index !== this.props.component.list[index].index) {
          attempt.marks += markIncrement;
        }
      } else {
        attempt.correct = false;
      }
    })
    if(attempt.marks === 0 && !prev) attempt.marks = 1;
    return attempt;
  }

  renderIcon(index: number) {
    if (this.props.attempt) {
      return (
        <ListItemIcon>
          {
            (this.props.attempt.answer[index].index === index) ? <DenimTickRect/> : <DenimCrossRect />
          }
        </ListItemIcon>
      );
    }
    return "";
  }

  renderOption(answer: Answer) {
    if (answer.optionType && answer.optionType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.optionFile}`} />;
    }
    return answer.option;
  }

  renderAnswer(answer: Answer) {
    if (answer.answerType && answer.answerType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.valueFile}`} />;
    }
    return answer.value;
  }

  render() {
    return (
      <div className="pair-match-play">
        <Grid container justify="center">
          <List style={{padding: 0}} className="answers-list">
          {
            this.props.component.list.map((item:any, i) => (
              <ListItem
                key={i}
                className={
                  `pair-match-play-option ${(item.optionType === QuestionValueType.Image || item.answerType === QuestionValueType.Image) ? "pair-match-image-choice" : ""}`
                }
              >
                {this.renderIcon(i)}
                <ListItemText>
                  <span className="pair-match-play-option-text">
                    {this.renderOption(item as any)}
                  </span>
                </ListItemText>
              </ListItem>
            ))
          }
          </List>
          <ReactSortable
            list={this.state.userAnswers}
            animation={150}
            style={{display:"inline-block"}}
            group={{ name: "cloning-group-name" }}
            className="answers-list"
            setList={(choices) => this.setUserAnswers(choices)}
          >
            {
              this.state.userAnswers.map((answer, i) => (
                <div
                  style={{display: "block"}} key={i}
                  className={
                    `pair-match-play-choice ${(answer.optionType === QuestionValueType.Image || answer.answerType === QuestionValueType.Image) ? "pair-match-image-choice" : ""}`
                  }
                >
                  <Grid container direction="row">
                    <Grid item xs={1} container justify="center" alignContent="center" style={{width: '100%', height: '100%'}}>
                      <DragIndicatorIcon/>
                    </Grid>
                    <Grid item xs={11} container justify="center" alignContent="center" className="pair-match-play-data">
                      {this.renderAnswer(answer)}
                    </Grid>
                  </Grid>
                </div>
              ))
            }
          </ReactSortable>
        </Grid>
        <ReviewGlobalHint
          attempt={this.props.attempt}
          isPhonePreview={this.props.isPreview}
          hint={this.props.question.hint}
        />
      </div>
    );
  }
}

export default PairMatch;
