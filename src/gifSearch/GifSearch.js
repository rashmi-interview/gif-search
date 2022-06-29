import { useEffect, useState, useRef } from 'react';
import { getAllGifs } from './gifSearch.service';
import './gifSearch.css';
import Creatable from 'react-select/creatable';

export function GifSearch() {
    const [gifs, setGifs] = useState([]);
    const [recentSuggestions, setRecentSuggestions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [pagination, setPagination] = useState({
        count: 25,
        offset: 0,
        totalCount: 100
    });
    const lastElement = useRef(null);
    const [gifIndex, setGifIndex] = useState(-1);

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            if (!isLoading) {
                submitGifSearch(searchText);
            }
        }
    };

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "0px",
            threshold: 1
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (lastElement.current) {
            observer.observe(lastElement.current);
            //observer.disconnect()
        }
    }, [handleObserver]);


    // Set Recent Suggestions
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
        localStorage.setItem('gifSearchText', JSON.stringify(recentSuggestions));
        setIsLoading(true);
        const response = await getAllGifs(searchValue);
        if (response.meta.msg.toUpperCase() === "OK") {
            setGifs(response.data)
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
                    setSearchText(inputValue.value)
                    submitGifSearch(inputValue.value);
                }}
                components={{
                    DropdownIndicator: null,
                    IndicatorSeparator: null,
                }}
                options={recentSuggestions.map((s) => { return { value: s, label: s } })}
            />
        </div>

        {isLoading && <div>Loading ...</div>}
        {isError && <div>Error!!!</div>}
        {!isLoading && !isError && <div className='grid-gif'>
            {gifs?.map((gif, index) => {
                let isActive = index === gifIndex;

                return <img key={gif.id + index} src={getSourceUrl(gif, index)}
                    style={{ cursor: isActive ? "pointer" : "auto" }}
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
        {!isLoading && !isError && <div style={{ height: "200px", width: "100%", color: "blue" }} ref={lastElement}></div>}
    </>
}