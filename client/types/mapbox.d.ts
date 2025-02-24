
declare module '@mapbox/mapbox-sdk/services/directions' {
    interface DirectionsOptions {
        waypoints: { coordinates: [number, number] }[];
        profile: string;
        geometries: string;
    }

    interface DirectionsResponse {
        body: {
            routes: {
                geometry: any;
                duration: number;
                distance: number;
            }[];
        };
    }

    function Directions(config: { accessToken: string }): {
        getDirections: (options: DirectionsOptions) => {
            send: () => Promise<DirectionsResponse>;
        };
    };
    export = Directions;
}