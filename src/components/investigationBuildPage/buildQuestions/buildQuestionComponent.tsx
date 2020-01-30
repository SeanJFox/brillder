import React from 'react'

import { Grid } from '@material-ui/core';

import ShortAnswer from './shortAnswer/shortAnswer';

import './buildQuestionComponent.scss'
import { QuestionTypeEnum, QuestionType } from '../../model/question';
import DragBox from './components/DragBox';


export interface QuestionProps {
  type: QuestionTypeEnum,
  history: any,
}

const BuildQuestionComponent: React.FC<QuestionProps> = ({ type, history }) => {
  console.log(QuestionType, QuestionTypeEnum)
  document.title = QuestionTypeEnum[type];
  const renderQuestion = () => {
    switch (type) {
      case (QuestionTypeEnum.ShortAnswer):
        return <ShortAnswer activeStep={1} />
      default:
        history.push('/build/investigation/question');
    }
    return "";
  }

  return (
    <div style={{width: '100%'}}>
    <Grid container justify="center" className="build-question-column" item xs={12}>
      <Grid container direction="row">
        <Grid container item xs={4} sm={3} md={2} className="left-sidebar">
          <DragBox name="Text" />
          <DragBox name="Hint" />
          <DragBox name="Quote" />
          <DragBox name="Image" />
          <DragBox name="Sound" />
          <DragBox name="Equation" />
        </Grid>
        <Grid container item xs={5} sm={6} md={8}>
          {
            renderQuestion()
          }
        </Grid>
        <Grid container item xs={3} sm={3} md={2} className="right-sidebar">
          <div>
            <button>Come back later</button>
            <button>Submit brick</button>
          </div>
        </Grid>
      </Grid>
    </Grid>
    <div className="build-question-fotter">
        Saved at 5:19pm
        <button>Save Anyway</button>
        Time Spent Building brick: 4hrs
      </div>
    </div>
  );
}

export default BuildQuestionComponent
