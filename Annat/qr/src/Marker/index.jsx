import React, { Component } from 'react'
import { Icon } from 'react-onsenui'
import './index.css'

export default class Marker extends Component {
  render() {
    const queue = this.props.queue
    const click = this.props.click
    return (
      <div className='text-blue marker-wrapper'>
        <Icon className='icon' icon='ion-ios-location'></Icon>
        <div onClick={() => click(queue)} className="clearfix marker-info">
          {queue.id}
        </div>
      </div>
    )
  }
}
