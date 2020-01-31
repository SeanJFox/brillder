import React from 'react'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';


export interface MissingWordComponentProps {
}

const MissingWordComponent: React.FC<MissingWordComponentProps> = () => {
  return (
    <div className="input-box ">
      <DragIndicatorIcon />
      <div>
        <input placeholder="Enter correct answer" />
      </div>
    </div>
  )
}

export default MissingWordComponent
