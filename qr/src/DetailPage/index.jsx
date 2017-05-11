import R from 'ramda'
import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import {Page, Dialog} from 'react-onsenui'
import './index.css'
import model from '../model'
import CustomToolbar from './../CustomToolbar'
import Chat from './../Chat'
import Marker from './../Marker'

export default class DetailPage extends Component {

  constructor(props) {
    super(props)
    this.notify = this.notify.bind(this)
    this.model = model
    this.toggleChatMode = this.toggleChatMode.bind(this)
    this.toggleJoinQueue = this.toggleJoinQueue.bind(this)
    this.createMapOptions = this.createMapOptions.bind(this)
    this.state = {
      chatMode: false
    }
  }
  toggleChatMode (state){
    this.setState({
      chatMode: state
    })
  }

  createMapOptions(maps) {
    // next props are exposed at maps
    // "Animation", "ControlPosition", "MapTypeControlStyle", "MapTypeId",
    // "NavigationControlStyle", "ScaleControlStyle", "StrokePosition", "SymbolPath", "ZoomControlStyle",
    // "DirectionsStatus", "DirectionsTravelMode", "DirectionsUnitSystem", "DistanceMatrixStatus",
    // "DistanceMatrixElementStatus", "ElevationStatus", "GeocoderLocationType", "GeocoderStatus", "KmlLayerStatus",
    // "MaxZoomStatus", "StreetViewStatus", "TransitMode", "TransitRoutePreference", "TravelMode", "UnitSystem"
    return {
      zoomControl: false,
      fullscreenControl: false,
      mapTypeControl: false
    };
  }

  toggleJoinQueue(queue) {
    if (queue.inQueue) {
      this.model.leaveQueue(queue)
    } else {
      this.model.joinQueue(queue)
    }
  }

  componentDidMount() {
    this.model.subscribe(this)
  }

  componentWillUnmount() {
    this.model.unsubscribe(this)
  }

  notify(updates) {
    this.setState(R.merge(this.state, updates))
  }

  render() {
    const { queues } = this.model.getState()
    const queue = R.find(R.propEq('id', this.props.queueId))(queues)
    const center = queue.coordinates
    const zoom = 17
    const renderMarker = queue => (
      <Marker
        {...queue.coordinates}
        queue={queue}
        click={()=>{}}
      />
    )

    const toggle = () => this.toggleJoinQueue(this.props.queue)
    const renderButtons = () =>(
      queue.inQueue
      ? <div className="button-wrapper">
          <div className="list__blue center add-button">
            Add 5 minutes
          </div>
          <div className="list__blue center red leave-button" onClick={() => this.toggleJoinQueue(queue)}>
            Leave Queue
          </div>
        </div>
      : <div className="list__blue nomargin center" onClick={() => this.toggleJoinQueue(queue)}>
          Join Queue
        </div>
    )
    return (
      <Page renderToolbar={() => <CustomToolbar/>}>
        <div className="pagePadding">
          <div className='map-wrapper'>
            <GoogleMapReact
              defaultCenter={center}
              defaultZoom={zoom}
              options={this.createMapOptions}
            >
              { renderMarker(queue) }
            </GoogleMapReact>
          </div>
          <div className="detail-content">
            <br />
            <strong>{queue.id}</strong><br />
            <small>{queue.address}</small><br />
            <small>{queue.hours}</small>

            <div className="clearBoth"></div>
            <br />

            <div className="left">
              <div className="left">
                <div className="detail__circle bg-blue">
                  <div className="detail__circle_adjustment">
                    8
                  </div>
                </div>
              </div>
              <div className="right detail__custom_margin">
                <strong>Persons</strong> <br />
                <small>Before you</small>
              </div>
              <div className="clearBoth"></div>
            </div>

            <div className="right">
              <div className="left">
                <div className="detail__circle bg-yellow">
                  <div className="detail__circle_adjustment">
                    20
                  </div>
                </div>
              </div>
              <div className="right detail__custom_margin">
                <strong>Minutes</strong> <br />
                <small>To wait</small>
              </div>
              <div className="clearBoth"></div>
            </div>
            <div className="clearBoth"></div>
            <br />

              {renderButtons()}

            <br />
            <Dialog isOpen={this.state.chatMode} className='displayChat'>
              <div className='displayChat__content'>
                <div className="closeChatBox" onClick={()=> this.toggleChatMode(false) }>
                  <ons-icon icon="ion-close-circled"></ons-icon>
                </div>
                <Chat/>
              </div>
            </Dialog>
            <div className="lockToBottom">
              <div className="left customSearch">
                <input onClick={()=> this.toggleChatMode(true) } placeholder="Need help?" type="search" className="search-input helpbar width100" />
              </div>
              <div className="right customSearch list__blue nopadding nomargin">
               Send
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
