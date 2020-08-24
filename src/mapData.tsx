// the props that are attached to every feature in the GeoJSON file
import { FeatureCollection, Geometry } from "geojson";

export interface GeoJsonProps {
  name: string;
  cartodb_id: number;
  created_at: string;
  updated_at: string;
  mood: number;
}

export const hamburgData: FeatureCollection<
  Geometry,
  GeoJsonProps
> = require("./data/hamburg.json");
// definition of possible dataset keys
export type DataSetType =
  | "mood"
  | "migration"
  | "populationChange"
  | "socialLiving"
  | "unemployment"
  | "employed"
  | "kita"
  | "crime"
  | "shopDistance"
  | "income"
  | "landPrice"
  | "noise"
  | "parkDistance"
  | "greenParty"
  | "socialIndex";
export type DataSet = {
  id: DataSetType;
  name: string;
  data: Record<string, number>;
  negated?: boolean; // true if more
};
export const allDataSets: Record<DataSetType, DataSet> = {
  mood: {
    id: "mood",
    name: "Mood index",
    data: {},
  },
  migration: {
    id: "migration",
    name: "Quote of migrated people (%)",
    data: normalize(require("./data/migrationQuote.json")),
    negated: true,
  },
  populationChange: {
    id: "populationChange",
    name: "Population change (absolute)",
    data: normalize(require("./data/PopulationChange.json")),
  },
  unemployment: {
    id: "unemployment",
    name: "Unemployment rate (%)",
    data: normalize(require("./data/UnemploymentRate.json")),
  },
  socialLiving: {
    id: "socialLiving",
    name: "Social housing (%)",
    data: normalize(require("./data/SocialLiving.json")),
  },
  employed: {
    id: "employed",
    name: "Employment rate (%)",
    data: normalize(require("./data/Beschaftigtenquote.json")),
    negated: true,
  },
  kita: {
    id: "kita",
    name: "Inhabitants per Kindergarden place",
    data: normalize(require("./data/KitaPlaces.json")),
  },
  crime: {
    id: "crime",
    name: "Crimes (per inhabitant)",
    data: normalize(require("./data/crimedata.json")),
  },
  greenParty: {
    id: "greenParty",
    name: "Green party vote changes (2017 to 2019, %)",
    data: normalize(require("./data/GreenPartyChanges1719.json")),
    negated: true,
  },
  shopDistance: {
    id: "shopDistance",
    name: "Average Distance to amenities (avg m)",
    data: normalize(require("./data/AverageDistanceToShop.json")),
  },
  income: {
    id: "income",
    name: "Medium income 2013 before tax (50 percentile)",
    data: normalize(require("./data/AverageIncome.json")),
    negated: true,
  },
  landPrice: {
    id: "landPrice",
    name: "Average Land Price per km²",
    data: normalize(require("./data/AverageLandprice.json")),
  },
  noise: {
    id: "noise",
    name: "Average noise on weekdays (in dB)",
    data: normalize(require("./data/AverageNoise.json")),
  },
  parkDistance: {
    id: "parkDistance",
    name: "Average distance to next park (m)",
    data: normalize(require("./data/distanceToPark.json")),
  },
  socialIndex: {
    id: "socialIndex",
    name: "Social index 2018 (normized)",
    data: normalize(require("./data/SocialIndex.json")),
  },
};

function normalize(data: Record<string, number>): Record<string, number> {
  const min: number = Math.min(...Array.from(Object.values(data)));
  const max: number = Math.max(...Array.from(Object.values(data)));
  const normalizedData: Record<string, number> = {};
  Object.entries(data).forEach(([location, number]: [string, number]) => {
    // normalize the data by scaling every value between 0 and 1, even for negative values
    normalizedData[location] = (number - min) / (max - min);
  });
  return normalizedData;
}

export function calculateMood(
  weightings: Map<DataSetType, number>,
  negated: Set<DataSetType>
): Record<string, number> {
  const moodData: Record<string, number> = {};
  Array.from(weightings.entries()).forEach(
    ([key, weighting]: [DataSetType, number]) => {
      Object.entries(allDataSets[key].data).forEach(
        ([location, number]: [string, number]) => {
          const sign: number = negated.has(key) ? -1 : 1;
          if (location in moodData) {
            moodData[location] += number * weighting * sign;
          } else {
            moodData[location] = number * weighting * sign;
          }
        }
      );
    }
  );
  return moodData;
}
