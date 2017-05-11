import React from 'react'
import ReactDOM from 'react-dom'
import GoogleMapReact from 'google-map-react'
import {Toolbar, Page, Button, Row, Col, Icon} from 'react-onsenui'
import './index.css'
import R from 'ramda'
import model from '../model'

import CustomToolbar from './../CustomToolbar'
import DetailPage from './../DetailPage'
import Marker from './../Marker'

export default class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.pushPage = this.pushPage.bind(this)
    this.notify = this.notify.bind(this)
    this.toggleJoinQueue = this.toggleJoinQueue.bind(this)
    this.createMapOptions = this.createMapOptions.bind(this)
    this.model = model
  }

  componentDidMount() {
    this.model.subscribe(this)
  }

  componentWillUnmount() {
    this.model.unsubscribe(this)
  }

  notify(newState) {
    this.setState(R.merge(this.state, newState))
  }

  toggleJoinQueue(queue) {
    console.log(queue)
    if (queue.inQueue) {
      this.model.leaveQueue(queue)
    } else {
      this.model.joinQueue(queue)
    }
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

  pushPage(queue) {
    this.props.navigator.pushPage({component: () => <DetailPage queueId={queue.id}/>})
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className='center'>Navigator</div>
      </Toolbar>
    )
  }

  render() {
    const { queues, mapMode } = this.model.getState()
    const center = { lat: 59.343404, lng: 18.061171 }
    const zoom = 15
    const renderQueue = (queue) => (
      <div key={queue.id}
           className="list__blue">

        <div className="left width60"
             onClick={() => this.pushPage(queue)}>
          <p className="nomargin"><b>{queue.id}</b></p>
          <small>{queue.address}</small>
        </div>

        <div className="right width40">

          <div className="center inlineBlock customButtonWidth" onClick={() => this.toggleJoinQueue(queue)}>
            <Icon icon={queue.inQueue ? 'ion-close-circled' : 'ion-checkmark-circled'}
                      className={ 'main__icon_size ' + (queue.inQueue ? 'text-red' : '')}>
            </Icon>
            <br />
            <small>
              { queue.inQueue
                  ? "Leave"
                  : "Join"
              }
            </small>
          </div>

          <div className="center inlineBlock">
            <div className="main__circle">
              <div className="main__circle_adjuster">
                30
              </div>
            </div>
            <small>Mins</small>
          </div>
        </div>

        <div className="clearBoth"></div>

      </div>
    )
    const renderMarker = queue => (
      <Marker
        {...queue.coordinates}
        queue={queue}
        click={this.pushPage}
      />
    )
    const renderMap = () => (
      <div className='main__map-wrapper'>
        <GoogleMapReact
          defaultCenter={center}
          defaultZoom={zoom}
          options={this.createMapOptions}

        >
          { queues.map(renderMarker) }
        </GoogleMapReact>
      </div>
    )
    const renderList = () => (
      <div>
        <div className="custom__header">Nearby Queues</div>
        { queues.map(renderQueue) }
      </div>
    )
    return (
      <Page renderToolbar={() => <CustomToolbar/>}>
        <div className="page-content">
          { mapMode
            ? renderMap()
            : renderList()
          }
        </div>
        <div className="map__button">
            <ons-icon onClick={this.model.toggleMapMode} 
                    icon={mapMode ? 'ion-ios-list-outline' : 'ion-map'} 
                    class="map_icon__center"></ons-icon>
        </div>
      </Page>
    )
  }
}
