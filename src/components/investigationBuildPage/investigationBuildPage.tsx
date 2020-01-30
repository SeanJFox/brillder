import React from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend'
import { Grid } from '@material-ui/core';
import update from 'immutability-helper';

import './investigationBuildPage.scss'
import BuildPageHeaderComponent from './header/pageHeader';
import BuildQuestionComponent from './buildQuestions/buildQuestionComponent';
import QuestionTypePage from './questionType/questionType';
import DragBox from './DragBox';
import BuildFotter from './build-fotter';
import DragableTabs from './dragTabs/dragableTabs';
import { Question, QuestionTypeEnum } from '../model/question';


interface InvestigationBuildProps extends RouteComponentProps<any> {
  fetchBrick: Function,
  fetchProForma: Function
}

const InvestigationBuildPage: React.FC<InvestigationBuildProps> = ({ history }: any) => {
  const [questions, setQuestions] = React.useState([{ id: 1, type: 0, active: true }] as Question[])

  let activeQuestion = questions.find(q => q.active == true) as Question;
  if (!activeQuestion) {
    console.log('Can`t find active question');
    activeQuestion = {} as Question;
  }
  
  const createNewQuestion = () => {
    const updatedQuestions = questions.slice();
    updatedQuestions.forEach(q => q.active = false);
    updatedQuestions.push({ id: questions.length + 1, type: 0, active: true });

    setQuestions(update(questions, {
      $set: updatedQuestions,
    }));
  }

  const moveQuestions = (dragIndex: number, hoverIndex: number, dragQuestion: any) => {
    setQuestions(
      update(questions, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragQuestion],
        ],
      }),
    )
  }

  const setQuestionType = (type: QuestionTypeEnum) => {
    if (!activeQuestion) {
      alert('Can`t set question type');
      return;
    }
    var index = questions.indexOf(activeQuestion);
    console.log("set question type ",  type);
    setQuestions(
      update(questions, {
        [index]: { type: { $set: type } }
      }),
    )

    history.push(`/build/investigation/question-component/${index + 1}`);
  }

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      alert("You can`t delete last question");
      return;
    }
    if (index !== 0) {
      setQuestions(
        update(questions, {
          $splice: [[index, 1]],
          0: { active: { $set: true } }
        }),
      )
    } else {
      setQuestions(
        update(questions, {
          $splice: [[index, 1]],
          [questions.length - 1]: {
            active: { $set: true }
          }
        }),
      )
    }
  }

  const selectQuestion = (index: number) => {
    const updatedQuestions = questions.slice();
    updatedQuestions.forEach(q => q.active = false);

    let selectedQuestion = updatedQuestions[index];
    if (selectedQuestion) {
      selectedQuestion.active = true;

      setQuestions(update(questions, {
        $set: updatedQuestions,
      }));
    }
  }

  return (
    <DndProvider backend={Backend}>
      <div className="investigation-build-page">
        <BuildPageHeaderComponent />
        <br></br>
        <br></br>
        <Grid container direction="row">
          <Grid container className="left-sidebar sidebar" justify="center" item xs={2} sm={1}>
            <Route exac path='/build/investigation/question-component/:questionId'>
              <div>>></div>
              <DragBox name="T" />
              <DragBox name="P" />
              <DragBox name="R" />
              <DragBox name="S" />
              <DragBox name="V" />
            </Route>
          </Grid>
          <Grid container item xs={8} sm={10}>
            <Grid container direction="row">
              <Grid xs={1} sm={2} item md={3}></Grid>
              <Grid container justify="center" item xs={10} sm={8} md={6}>
                <DragableTabs
                  questions={questions} createNewQuestion={createNewQuestion}
                  moveQuestions={moveQuestions} selectQuestion={selectQuestion}
                  removeQuestion={removeQuestion} />
                <Switch>
                  <Route exac path='/build/investigation/question-component'>
                    <BuildQuestionComponent history={history} type={activeQuestion.type} />
                  </Route>
                  <Route exac path='/build/investigation/question-component/:questionId'>
                    <BuildQuestionComponent history={history} type={activeQuestion.type} />
                  </Route>
                  <Route
                    exec path='/build/investigation/question/:questionId'
                    component={() => <QuestionTypePage setQuestionType={setQuestionType} questionType={activeQuestion.type} />} >
                  </Route>
                  <Route
                    exec path='/build/investigation/question'
                    component={() => <QuestionTypePage setQuestionType={setQuestionType} questionType={activeQuestion.type} />} >
                  </Route>
                </Switch>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br></br>
        <BuildFotter />
      </div>
    </DndProvider>
  )
}

export default InvestigationBuildPage