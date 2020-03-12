import React from 'react';

import './ChooseOne.scss';
import { Question } from "components/model/question";
import CompComponent from '../comp';
import { Button } from '@material-ui/core';
import {ComponentAttempt} from 'components/play/brick/model/model';


interface ChooseOneChoice {
  value: string;
  checked: boolean;
}

interface ChooseOneComponent {
  type: number;
  list: ChooseOneChoice[];
}

interface ChooseOneProps {
  question: Question;
  component: ChooseOneComponent;
  attempt?: ComponentAttempt;
  answers: number;
}

interface ChooseOneState {
  activeItem: number;
}

class ChooseOne extends CompComponent {
  constructor(props: ChooseOneProps) {
    super(props);

    let activeItem = -1;
    if (props.answers >= 0) {
      activeItem = props.answers;
    }

    this.state = { activeItem } as ChooseOneState;
  }

  setActiveItem(activeItem: number) {
    this.setState({ activeItem });
  }

  getAnswer(): string[] {
    return this.state.activeItem;
  }

  getState(entry: number): number {
    if (this.props.attempt.answer[entry]) {
      if (this.props.attempt.answer[entry].toLowerCase().replace(/ /g, '') === this.props.component.list[entry].answer.toLowerCase().replace(/ /g, '')) {
        return 1;
      } else { return -1; }
    } else { return 0; }
  }

  mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
    console.log('mark', attempt, prev);
    const {component} = this.props as ChooseOneProps;
    // If the question is answered in review phase, add 2 to the mark and not 5.
    let markIncrement = prev ? 2 : 5;
    attempt.maxMarks = 5;

    // set attempt.correct to true by answer index.
    attempt.correct = false;
    component.list.forEach((choice, index) => {
      if (attempt.answer === index) {
        if (choice.checked === true) {
          attempt.correct = true;
        }
      }
    });

    // if the attempt is correct, add the mark increment.
    if (attempt.correct) attempt.marks = markIncrement;
    // if there is an answer given and the program is in the live phase, give the student an extra mark.
    else if (attempt.answer != null && !prev) attempt.marks = 1;
    else attempt.marks = 0;
    return attempt;
  }

  render() {
    const { activeItem } = this.state;

    return (
      <div className="choose-one-live">
        {
          this.props.component.list.map((input: any, index: number) =>
            <Button
              className={(index === activeItem) ? "choose-choice active" : "choose-choice"}
              key={index}
              onClick={() => this.setActiveItem(index)}>
              {input.value}
            </Button>
          )
        }
      </div>
    );
  }
}

export default ChooseOne;