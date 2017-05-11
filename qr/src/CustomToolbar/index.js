import React from 'react'
import './index.css'

export default class CustomToolbar extends React.PureComponent {
  render() {
    return (
      <ons-toolbar class="CustomToolbar">
      
        <div className="left animate">
          <ons-toolbar-button>
            <ons-back-button>
              Back
            </ons-back-button>
          </ons-toolbar-button>
        </div>
      
        <div className="center CustomToolbar__title">QueueR</div>
      </ons-toolbar>
    )
  }
      
}
