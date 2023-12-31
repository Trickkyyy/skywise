import { useState, createContext, ReactNode, useEffect } from "react";
import { ArrDepType } from "../types/flight_types";
import { useQuery } from "react-query";
import {
  API_KEY,
  fetchArrivalData,
  fetchDepartureData,
} from "../utils/fetchHelpers";

interface ApiResponse<T> {
  data: T[];
}

interface FetchContextType<T> {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  arrivalData: ApiResponse<T> | undefined;
  setArrivalData: React.Dispatch<
    React.SetStateAction<ApiResponse<T> | undefined>
  >;
  departureData: ApiResponse<T> | undefined;
  setDepartureData: React.Dispatch<
    React.SetStateAction<ApiResponse<T> | undefined>
  >;
  searchHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clickHandler: () => void;
  keyHandler: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  arrivalActive: boolean;
  setArrivalActive: React.Dispatch<React.SetStateAction<boolean>>;
  departureActive: boolean;
  setDepartureActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FetchContext = createContext<FetchContextType<ArrDepType>>({
  search: "",
  setSearch: () => {},
  arrivalData: undefined,
  setArrivalData: () => {},
  departureData: undefined,
  setDepartureData: () => {},
  searchHandler: (_e) => {},
  clickHandler: () => {},
  keyHandler: (_e) => {},
  arrivalActive: false,
  setArrivalActive: () => {},
  departureActive: false,
  setDepartureActive: () => {},
});

interface FetchProviderProps {
  children: ReactNode;
}

export const FetchProvider = ({ children }: FetchProviderProps) => {
  const [search, setSearch] = useState<string>("");
  const [departureData, setDepartureData] = useState<ApiResponse<ArrDepType>>();
  const [arrivalData, setArrivalData] = useState<
    ApiResponse<ArrDepType> | undefined
  >();
  const [arrivalActive, setArrivalActive] = useState<boolean>(false);
  const [departureActive, setDepartureActive] = useState<boolean>(false);

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  //!To remove in the future
  useEffect(() => {
    console.log("Arrival:", arrivalData);
    console.log("Departure:", departureData);
  }, [arrivalData, departureData]);

  const searchFormatted = search.trim().replace(/[^\w ]/g, ""); //Removing special symbols if any in the search params.

  const { refetch: arrFetch } = useQuery({
    queryKey: ["arrivalData", API_KEY, searchFormatted],
    queryFn: () => fetchArrivalData(searchFormatted),
    cacheTime: 0,
    enabled: false,
    onSuccess: (data) => setArrivalData(data),
  });
  const { refetch: depFetch } = useQuery({
    queryKey: ["departureData", API_KEY, searchFormatted],
    queryFn: () => fetchDepartureData(searchFormatted),
    cacheTime: 0,
    enabled: false,
    onSuccess: (data) => {
      setDepartureData(data);
      console.log("State", departureData);
    },
  });
  const clickHandler = async () => {
    if (searchFormatted === "") {
      //! TODO: Visualization of Bad Requests
      console.log(`Bad Request`);
      return;
    }

    await Promise.all([arrFetch(), depFetch()]);
    if (search.trim() !== "") {
      setSearch("");
      setDepartureActive(false);
      setArrivalActive(true);
    }
  };

  const keyHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchFormatted === "") {
        //! TODO: Visualization of Bad Requests
        console.log(`Bad Request`);
        return;
      }
      await Promise.all([arrFetch(), depFetch()]);

      if (search.trim() !== "") {
        setSearch("");
        setDepartureActive(false);
        setArrivalActive(true);
      }
    }
  };

  const value = {
    search,
    setSearch,
    arrivalData,
    setArrivalData,
    departureData,
    setDepartureData,
    searchHandler,
    clickHandler,
    keyHandler,
    arrivalActive,
    setArrivalActive,
    departureActive,
    setDepartureActive,
  };

  return (
    <FetchContext.Provider value={value}>{children}</FetchContext.Provider>
  );
};
