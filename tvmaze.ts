import axios, { AxiosResponse } from "axios";
import * as $ from 'jquery';
import { IShow, IEpisode, ITvApiResponse } from "./interfaces";

const $showsList: JQuery<HTMLElement> = $("#showsList");
const $episodesArea: JQuery<HTMLElement> = $("#episodesArea");
const $searchForm: JQuery<HTMLElement> = $("#searchForm");

const BASE_URL: string = `https://api.tvmaze.com/`;
const DEFAULT_IMG_URL: string = "https://tinyurl.com/tv-missing";

//TODO: ADD BASE URL

/*********** SHOWS LOGIC  *****************/


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term: string): Promise<IShow[]> {
  const tvMazeURL: string = `${BASE_URL}search/shows`;

  const resp: AxiosResponse<any> = await axios.get(tvMazeURL, { params: { q: term } });
  let showData: IShow[] = resp.data;

  //TODO: refactor using map

  showData = resp.data.map( show:IShow => _addShow(show));

  function _addShow(show: IShow): IShow{
    let { id, name, summary, image } = show.show;

    const showObject: IShow = {
      id: id,
      name: name,
      summary: "",
      image: { medium: "" },
    };

    //check solution for this
    showObject.summary = summary ? summary : 'No summary.'
    //global const for missing url
    showObject.image.medium = image ? image.medium : DEFAULT_IMG_URL;

    return showObject;
  }

  return showData;
}


/** Given list of shows, create markup for each and to DOM */
//void isnt necessary
function populateShows(shows: IShow[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image.medium}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay(): Promise<void> {
  const term: string = $("#searchForm-term").val() as string;
  const shows: IShow[] = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

//try submit event
$searchForm.on("submit", async function (evt: JQuery.Event): Promise<void> {
  evt.preventDefault();
  $episodesArea.hide();
  $showsList.show();
  await searchForShowAndDisplay();
});

/*********** EPISODES LOGIC  *****************/

/** Given a show ID, get episode JSON from TvMaze API and returns map of
 * episode data with following keys:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number): Promise<IEpisode[]> {
  const episodesURL: string = `${BASE_URL}shows/${id}/episodes`;

  const episodeData: { data: IEpisode[] } = await axios.get(episodesURL);

  const episodeMap: IEpisode[] = episodeData.data.map(
    //next up one
    e => {
      return {
        id: e.id,
        name: e.name,
        season: e.season,
        number: e.number
      }
    });

  return episodeMap;
}

/** Given map of episodes, appends new <li> items to
 * #episodeList <ul> with string template literal
 * containing episode data from episode map*/
function populateEpisodes(episodes: IEpisode[]) {
  $showsList.hide();
  $episodesArea.show();

  for (let episode of episodes) {
    const newEpisodeItem: JQuery<HTMLElement> = $("<li>").text(
      `${episode.name} (season ${episode.season}, number ${episode.number})`
    );

    $("#episodesList").append(newEpisodeItem);
  }

}

async function handleGetEpisodes(e: JQuery.ClickEvent<HTMLElement>){
  //let id = $(e.target).closest().attr("data-show-id");
  $("#episodesList").empty();

  let id: number = e.target.closest(".Show").data.showId;
  let episodes: IEpisode[] = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

/**Adds event listener to shows list that functions
 * on created <buttons> with class ".Show-getEpisodes"
 * calls getEpisodesOfShow() to generate map data that
 * is passed to populateEpisodes()*/
$("#showsList").on("click", ".Show-getEpisodes", handleGetEpisodes);