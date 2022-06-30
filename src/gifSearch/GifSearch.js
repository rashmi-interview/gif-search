import { useEffect, useState } from 'react';
import { getAllGifs } from './gifSearch.service';
import './gifSearch.css';
import Creatable from 'react-select/creatable';
import InfiniteScroll from 'react-infinite-scroller';

export function GifSearch() {
    const [gifs, setGifs] = useState([]);
    const [recentSuggestions, setRecentSuggestions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [gifIndex, setGifIndex] = useState(-1);
    const [pagination, setPagination] = useState({
        count: 0,
        offset: 0,
        totalCount: 0
    });

    // Set Recent Suggestions from local storage
    useEffect(() => {
        let searchTextString = localStorage.getItem('gifSearchText');
        let searchTextList = JSON.parse(searchTextString);
        if (searchTextList !== null && Array.isArray(searchTextList)) {
            setRecentSuggestions(searchTextList);
        }
    }, [])

    async function submitGifSearch(searchValue) {
        if (!searchValue) return;

        let recentSuggestionsUpdated = [...recentSuggestions, searchValue];
        let recentSuggestionsUpdatedSet = new Set(recentSuggestionsUpdated);

        setRecentSuggestions(Array.from(recentSuggestionsUpdatedSet));
        console.log(recentSuggestionsUpdatedSet);
        localStorage.setItem('gifSearchText', JSON.stringify(Array.from(recentSuggestionsUpdatedSet)));

        setIsLoading(true);
        let newOffset = pagination.offset + pagination.count;
        const response = await getAllGifs(searchValue, newOffset, 25);
        if (response.meta.msg.toUpperCase() === "OK") {
            let allGifs = [...gifs, ...response.data]
            setGifs(allGifs)
            setPagination({
                count: response.pagination.count,
                offset: response.pagination.offset,
                totalCount: response.pagination.total_count
            })
        }
        else {
            setIsError(true);
        }
        setIsLoading(false);
    }

    function getSourceUrl(gif, index) {
        return (index === gifIndex) ? gif.images.fixed_width.url : gif.images.fixed_width_still.url;
    }

    return <>
        <div className='gif-search-input'>
            <Creatable
                isSearchable
                isClearable
                hideSelectedOptions={false}
                value={{ label: searchText, value: searchText }}
                onChange={(inputValue, actionMeta) => {
                    if (!inputValue) return;

                    const isNewSearch = searchText === inputValue.value

                    setSearchText(inputValue.value)
                    submitGifSearch(inputValue.value, isNewSearch);
                }}
                components={{
                    DropdownIndicator: null,
                    IndicatorSeparator: null,
                }}
                options={recentSuggestions.map((s) => { return { value: s, label: s } })}
            />
        </div>

        <InfiniteScroll
            pageStart={0}
            loadMore={() => { if (!isLoading) submitGifSearch(searchText) }}
            hasMore={!isLoading ? (pagination.totalCount > pagination.count + pagination.offset) : false}
            loader={<h4>Loading...</h4>}
            threshold={100}
        >

            {!isLoading && !isError && <div className='grid-gif'>
                {gifs?.map((gif, index) => {
                    let isActiveGif = index === gifIndex;
                    let isAnyGifActive = gifIndex >= 0;
                    return <img key={gif.id + index} src={getSourceUrl(gif, index)}
                        style={{ cursor: isAnyGifActive ? isActiveGif ? "pointer" : "auto" : "pointer" }}
                        onClick={(e) => {
                            if (gifIndex > 0) {
                                setGifIndex(-1);
                            }
                            else {
                                setGifIndex(index);
                            }
                        }} />
                })}
            </div>}
        </InfiniteScroll>
    </>
}