import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';
import dartStations from './dartStations';
// import oaderIcon from './assets/cycle-loader.svg';
import { ReactComponent as Logo } from './assets/cycle-loader.svg';
function App() {
  const stationList = ['Glenageary', 'Lansdowne', 'Pearse', 'Connolly'];

  const [selectedStation, setSelectedStation] = useState();
  const [selectedStationCode, setSelectedStationCode] = useState();
  const [scrollDepth, setScrollDepth] = useState(0);
  const [stationInfo, setStationInfo] = useState([{}]);
  const [favStationList, setFavStationList] = useState([]);

  const [hasError, setErrors] = useState(false);
  const [planets, setPlanets] = useState({});

  const [stationData, setStationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const stationsLister = stationData.map((station, index) => {
    return (
      <button
        key={index}
        className="btn
        btn-white"
        onClick={() => {
          setSelectedStation(station.StationDesc);
          setSelectedStationCode(station.StationCode);
        }}
      >
        <Link to={`/station/${station.StationDesc.toLowerCase()}`}>
          {station.StationDesc}
        </Link>
      </button>
    );
  });

  async function fetchData() {
    const corsProxy =
      'https://cors-anywhere.herokuapp.com/http://api.irishrail.ie';
    // 'https://cors-anywhere.herokuapp.com/http://api.irishrail.ie';
    // const corsProxy = 'http://cors.now.sh/http://api.irishrail.ie';

    const stationCode = selectedStationCode;
    console.log(
      `get data ${corsProxy}/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=${stationCode}`
    );

    const response = await fetch(
      `${corsProxy}/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=${stationCode}`
    );
    setLoading(false);
    // let data = await response.json();
    return response;
  }

  useEffect(() => {
    setLoading(true);
    let sequence = 0;
    let knarray = [];
    let allDarts = [];
    let metaArray = [
      'Stationcode',
      'Traintype',
      'Origin',
      'Destination',
      'Origintime',
      'Destinationtime',
      'Status',
      'Lastlocation',
      'Duein',
      'Exparrival',
      'Stationfullname',
      'Querytime',
      'Traindate',
      'Late',
      'Expdepart',
      'Scharrival',
      'Schdepart',
      'Direction',
      'Locationtype'
    ];
    fetchData(selectedStationCode)
      .then(response => {
        console.log(response);
        return response.text();
      })
      .then(responseText => {
        console.log(responseText);
        var parser = new DOMParser();
        var doc = parser.parseFromString(responseText, 'application/xml');
        let x = doc.documentElement;
        //   // this.setState({ isLoading: false });
        console.log('x:', x);

        // if (x.hasChildNodes()) {
        if (x.childNodes && x.childNodes.length) {
          var children = x.childNodes;
          let objectArray = [];
          children.forEach(value => {
            if (isNaN(value.length)) {
              objectArray.push(value);
            }
          });

          let dartData = objectArray.filter(val => {
            console.log('2', val);
            return val.children;
          });

          // console.log('3', dartData);
          dartData.forEach(value => {
            knarray = [];
            console.log(':[====]_[====]_[====]:.');
            metaArray.forEach(attr => {
              knarray[attr] = value.getElementsByTagName(attr)[0].innerHTML;
              console.log(`knarray: ${attr} - ${knarray[attr]}`);
            });

            allDarts[sequence] = knarray;
            sequence++;
          });
          console.log('finito', knarray, allDarts);
          setStationInfo(allDarts);

          // if (this.state.directionFilter !== 'All') {
          //   console.log('need to apply the direction filter again');
          //   this.filterDirection(this.state.directionFilter);
          // } else {
          //   // this.setState({ directionFilter: 'All' });
          //   this.filterTime();
          // }
        }
      })
      .then(
        result => {},
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        error => {
          // this.setState({ isLoading: false });
          console.log('Error', error);
        }
      );
    // });
  }, [selectedStation]);

  useEffect(() => {
    console.log('Got json stations', dartStations.objStation);
    setStationData(dartStations.objStation);
  }, []);

  function determineUserScrollDepth() {
    const scrolled =
      document.documentElement.scrollTop || document.body.scrollTop;
    setScrollDepth(scrolled);
  }

  useEffect(() => {
    window.addEventListener('scroll', determineUserScrollDepth);

    return function() {
      window.removeEventListener('scroll', determineUserScrollDepth);
    };
  });

  function StationList() {
    const ble = stationList.map((number, index) => {
      return (
        <div key={index}>
          <p>
            {number}
            <button
              className="btn btn-blue"
              onClick={() => {
                setFavStationList([...favStationList, stationList[index]]);
              }}
            >
              +s
            </button>
          </p>
        </div>
      );
    });
    return ble;
  }

  function displayTimes() {
    console.log('xx in here', stationInfo);
    const trainDeets = stationInfo.map(data => {
      console.log(`xx station: ${data.Direction} ${data.Exparrival}`);
      return (
        <div>
          TRAIN:
          {data.Direction} {data.Exparrival}
        </div>
      );
    });
    console.log(`xx return:`, trainDeets);
    return trainDeets;
  }

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `Dart Times`;
  });
  return (
    <Router>
      <div>
        {stationsLister}
        <div></div>
        <p>Favourite Stations: {favStationList.toString()}</p>
        <p>
          Station Info:
          <p className={loading ? `block` : `hidden`}>
            <Logo />
          </p>
          <p className={loading ? `hidden` : `block`}>
            {loading ? `Loading` : displayTimes()}
          </p>
        </p>
        <p>
          Selected Station: {selectedStation} {selectedStationCode}
        </p>
        <button
          className="btn btn-blue"
          onClick={() => {
            setSelectedStation([stationList[0]]);
          }}
        >
          Select Station
        </button>
        <StationList />
        <Route exact path="/" component={Home} />
        <Route path="/station/glenageary" component={Glenageary} />
        <Route path="/station/lansdowne" component={Lansdowne} />
        <h1>--{selectedStation}--</h1>
        <p>You've scrolled this far: {scrollDepth}</p>
        <div>
          <span>{JSON.stringify(planets)}</span>
          <hr />
          <span>Has error: {JSON.stringify(hasError)}</span>
        </div>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function Glenageary() {
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `Dart Times Glenageary`;
  });
  return (
    <div>
      <h1>Glenageary</h1>
    </div>
  );
}

function Lansdowne({ match }) {
  return (
    <div>
      <h2>Topics</h2>
      <ul className="list-disc list-inside">
        <li>
          <Link to={`${match.url}/rendering`}>Rendering with React</Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Route path={`${match.path}/:topicId`} component={Topic} />
      <Route
        exact
        path={match.path}
        render={() => <h3>Please select a topic.</h3>}
      />
    </div>
  );
}

function Topic({ match }) {
  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  );
}

export default App;
