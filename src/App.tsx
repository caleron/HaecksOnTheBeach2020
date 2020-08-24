import React, { useEffect, useState } from "react";
import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
// @ts-ignore
import KeplerGl from "kepler.gl";
import { Sidebar } from "./Sidebar";

function App() {
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [width, setWidth] = useState<number>(window.innerWidth * 0.8);
  // adjust size of the map on window resize
  // unfortunately, we need to specify the size in pixels, so css is not sufficient
  useEffect(() => {
    window.onresize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth * 0.8);
    };
    return () => {
      window.onresize = null;
    };
  }, []);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "row",
        alignContent: "flex-start",
      }}
    >
      <Provider store={store}>
        <div style={{ width: "20vw", height: "100vh", overflowY: "scroll" }}>
          <Sidebar />
        </div>
        <div style={{ width: "80vw" }}>
          <KeplerGl
            id="foo"
            height={height}
            width={width}
            mapboxApiAccessToken={
              // insert mapbox access token here (see https://account.mapbox.com/access-tokens/)
              ""
            }
            appName={"Mood map"}
            mapboxApiUrl={"https://api.mapbox.com"}
          />
        </div>
      </Provider>
    </div>
  );
}

export default App;
