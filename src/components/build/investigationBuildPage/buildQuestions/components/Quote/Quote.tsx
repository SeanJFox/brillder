import React from 'react'
import { Grid } from '@material-ui/core';

import './Quote.scss'
import DocumentCKEditor from 'components/baseComponents/DocumentEditor';


export interface QuoteComponentProps {
  locked: boolean
  index: number
  data: any
  updateComponent(component: any, index: number): void
}

const QuoteComponent: React.FC<QuoteComponentProps> = ({locked, index, data, updateComponent}) => {
  const onChange = (htmlString: string) => {
    let comp = Object.assign({}, data);
    comp.value = htmlString;
    updateComponent(comp, index);
  }

  return (
    <div className="question-build-quote-editor">
      <div className="text-label-container">
        <Grid className="text-label" container justify="center" alignContent="center">
          Quote
        </Grid>
      </div>
      <DocumentCKEditor
        data={data.value}
        placeholder=""
        toolbar={['bold', 'italic', 'fontColor', 'bulletedList', 'numberedList']}
        onChange={onChange}
      />
    </div>
  );
}

export default QuoteComponent
