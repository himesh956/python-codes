import { Schema } from "mongoose";

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface ILocation {
  city: string;
  state?: string;
  country?: string;
  pincode?: string;
  geoPoint?: IGeoPoint;
}

const geoPointSchema = new Schema<IGeoPoint>(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) => value.length === 2,
        message: "GeoPoint coordinates must contain [longitude, latitude]",
      },
    },
  },
  {
    _id: false,
    id: false,
  }
);

export const locationSchema = new Schema<ILocation>(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
    },

    // IMPORTANT:
    // Do not create an empty GeoJSON object when coordinates
    // are not supplied.
    geoPoint: {
      type: geoPointSchema,
      required: false,
      default: undefined,
    },
  },
  {
    _id: false,
    id: false,
  }
);