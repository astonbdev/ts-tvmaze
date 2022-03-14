export interface IShow {
  id: number,
  name: string,
  summary: string
  image: { medium: string }
}

//get rid of info
export interface IEpisode {
  id: number,
  name: string,
  season: number,
  number: number
}

//too closely tied to axios
//intreface should directly relate to the data itself
//dig into the return
export interface ITvApiResponse {
  data: { show: IShow }[]
}