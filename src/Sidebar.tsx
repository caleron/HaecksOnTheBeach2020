import React, { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Typography,
  Button,
} from "@material-ui/core";
// @ts-ignore
import KeplerGlSchema from "kepler.gl/schemas";
// @ts-ignore
import { addDataToMap, resetMapConfig } from "kepler.gl/actions";
// @ts-ignore
import Processors from "kepler.gl/processors";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { baseLayer, keplerConfig } from "./keplerConfig";
import {
  allDataSets,
  calculateMood,
  DataSet,
  DataSetType,
  GeoJsonProps,
  hamburgData,
} from "./mapData";

// the initial state to use. by default, all data is available in the kepler.gl map
const allMapsSelected: Map<DataSetType, number> = new Map<DataSetType, number>(
  Object.values(allDataSets).map((val) => {
    return [val.id, 50];
  })
);
const defaultNegated: Set<DataSetType> = new Set<DataSetType>(
  Object.values(allDataSets)
    .filter((value) => value.negated)
    .map((val: DataSet) => {
      return val.id;
    })
);

export const Sidebar: React.FunctionComponent = () => {
  // required to dispatch updates to the kepler.gl redux store
  const dispatch: Dispatch<any> = useDispatch();
  // the selected data sets to include in the map and mood index, mapped to their weighting
  const [displayDataSets, setDisplayDataSets] = useState<
    Map<DataSetType, number>
  >(allMapsSelected);
  const [negatedTypes, setNegatedTypes] = useState<Set<DataSetType>>(
    new Set<DataSetType>(defaultNegated)
  );

  const setDataSets: () => void = useCallback(() => {
    // remove all previously displayed data
    dispatch(resetMapConfig());
    const layers: Array<typeof baseLayer> = [];

    // add all selected data sets to the map and mood index
    const datasets = Array.from(displayDataSets.keys()).map(
      (key: DataSetType) => {
        // retrieve the data set by key
        const entry: DataSet = allDataSets[key];
        // copy the base GeoJSON so we can modify it
        const dataCopy: FeatureCollection<Geometry, GeoJsonProps> = JSON.parse(
          JSON.stringify(hamburgData)
        );
        // if we want to display the mood, calculate it from all displayed data sets
        const entryData =
          key === "mood"
            ? calculateMood(displayDataSets, negatedTypes)
            : entry.data;
        // assign the mood (or whatever normalized metric) to each city district
        dataCopy.features.forEach((f: Feature<Geometry, GeoJsonProps>) => {
          f.properties.mood = entryData[f.properties.name];
        });

        // copy the base kepler.gl layer which I retrieved using KeplerGlSchema.getConfigToSave
        const layer: typeof baseLayer = JSON.parse(JSON.stringify(baseLayer));
        // assign necessary IDs and labels
        layer.id = entry.id;
        layer.config.dataId = entry.id;
        layer.config.label = entry.name;
        // show only mood by default, but show all if mood is not selected
        layer.config.isVisible =
          entry.id === "mood" || !displayDataSets.has("mood");
        layers.push(layer);

        return {
          // kepler.gl cannot directly use GeoJSON, it has to be converted to an internal format
          data: Processors.processGeojson(dataCopy),
          info: {
            id: entry.id,
            label: entry.name,
          },
        };
      }
    );
    // mutate the base config by appending the new layers
    keplerConfig.config.visState.layers = layers;

    // dispatch the update to the redux store
    dispatch(
      addDataToMap({
        datasets: datasets,
        options: {
          centerMap: true,
          readOnly: false, // true will hide the included kepler.gl sidebar
        },
        config: keplerConfig,
      })
    );

    // seems like "addDataToMap" does not fully support the config provided to it, so load the config separately again
    KeplerGlSchema.load({}, keplerConfig);
  }, [dispatch, displayDataSets, negatedTypes]);

  // set the initial datasets at first load
  useEffect(setDataSets, []);

  // update the displayed data sets delayed 1 second after the last state change (i.e. change in checkboxes / sliders)
  useEffect(() => {
    const timeoutRef = setTimeout(setDataSets, 1000);
    return () => clearTimeout(timeoutRef);
  }, [displayDataSets, setDataSets]);

  // removes / adds the given DataSetType to the mood index and the map
  function toggleDisplay(type: DataSetType) {
    const copy: Map<DataSetType, number> = new Map(displayDataSets);
    if (displayDataSets.has(type)) {
      copy.delete(type);
    } else {
      // set an initial weighting
      copy.set(type, 50);
    }
    setDisplayDataSets(copy);
  }

  function toggleNegated(type: DataSetType) {
    const copy: Set<DataSetType> = new Set(negatedTypes);
    if (negatedTypes.has(type)) {
      copy.delete(type);
    } else {
      copy.add(type);
    }
    setNegatedTypes(copy);
  }

  return (
    <div>
      <div style={{ padding: "0 0 1rem 2rem" }}>
        <Button
          variant={"contained"}
          color={"primary"}
          style={{ margin: "1rem" }}
          onClick={() => setDisplayDataSets(new Map())}
        >
          Uncheck all
        </Button>
        <Button
          variant={"contained"}
          color={"primary"}
          onClick={() => setDisplayDataSets(new Map(allMapsSelected))}
        >
          Check all
        </Button>{" "}
        <Button
          variant={"contained"}
          color={"primary"}
          onClick={() => setNegatedTypes(new Set(defaultNegated))}
        >
          Default negated
        </Button>
        {Object.values(allDataSets).map((entry: DataSet) => {
          return (
            <>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={displayDataSets.has(entry.id)}
                      onClick={() => toggleDisplay(entry.id)}
                    />
                  }
                  label={entry.name}
                />
              </FormGroup>
              {displayDataSets.has(entry.id) && entry.id !== "mood" && (
                <>
                  <Typography>Adjust weight in mood</Typography>
                  <Slider
                    value={displayDataSets.get(entry.id)}
                    max={100}
                    style={{ width: "50%" }}
                    onChange={(event, value) => {
                      const copy: Map<DataSetType, number> = new Map(
                        displayDataSets
                      );
                      copy.set(entry.id, value as number);
                      setDisplayDataSets(copy);
                    }}
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={negatedTypes.has(entry.id)}
                        onClick={() => toggleNegated(entry.id)}
                      />
                    }
                    label={"Negate (higher = better)"}
                  />
                </>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};
