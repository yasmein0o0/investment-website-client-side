import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { autocompleteThunk } from "../redux/autocomplete";
import { searchThunk } from "../redux/ticker";
import { setInfo } from "../redux/ticker";
import { useNavigate } from "react-router-dom";

export const Autocomplete = ({
  placeholder = "Search stocks...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.autocomplete);
  const search = useSelector((state) => state.ticker);

  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const onSelect = (searchTerm) => {
    console.log(searchTerm);
    dispatch(searchThunk({ symbol: searchTerm, interval: null }));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only search if user typed 2+ letters
    if (value.length >= 2) {
      // Wait 300ms after typing stops before searching
      timerRef.current = setTimeout(() => {
        dispatch(autocompleteThunk(value));
        setShowSuggestions(true);
      }, 300);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const displayText =
      suggestion.longname || suggestion.search_value || suggestion;
    const prefix = suggestion.symbol;
    setQuery(displayText);
    setShowSuggestions(false);
    dispatch(setInfo({ name: displayText, symbol: prefix }));
    navigate("/home");
    if (onSelect) {
      onSelect(prefix);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setQuery("");

    if (onSelect && query.trim()) {
      onSelect(query.trim());
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Get suggestions from data
  const suggestions = data?.body || data || [];
  console.log(suggestions);

  return (
    <div className={`search-container ${className}`} ref={inputRef}>
      <form onSubmit={handleSubmit} className="autocomplete-form">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="autocomplete-input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="autocomplete-button"
          disabled={search.loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentcolor"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </svg>
        </button>
      </form>

      {showSuggestions && (
        <div className="suggestions-dropdown">
          {loading ? (
            <div className="suggestion-item loading">Searching...</div>
          ) : error ? (
            <div className="suggestion-item error">Error: {error}</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              // Get text to display
              const { longname } = suggestion;

              return (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {longname}
                </div>
              );
            })
          ) : query.length >= 2 ? (
            <div className="suggestion-item no-results">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
