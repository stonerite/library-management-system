import React, { createContext, useContext, useReducer, useEffect } from 'react';

export const ReadingListContext = createContext(null);

const STORAGE_KEY = 'readingList';

export const readingListReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_BOOK': {
      const bookToAdd = action.payload;
      if (!bookToAdd || !bookToAdd.id) return state;
      const alreadyExists = state.some((item) => item.id === bookToAdd.id);
      if (alreadyExists) {
        return state;
      }
      return [...state, bookToAdd];
    }

    case 'REMOVE_BOOK': {
      const targetId =
        typeof action.payload === 'object' && action.payload !== null
          ? action.payload.id
          : action.payload;
      return state.filter((item) => item.id !== targetId);
    }

    case 'CLEAR_LIST': {
      return [];
    }

    case 'SET_LIST': {
      return Array.isArray(action.payload) ? action.payload : [];
    }

    default:
      return state;
  }
};

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to restore reading list from localStorage:', error);
    return [];
  }
};

export function ReadingListProvider({ children }) {
  const [readingList, dispatch] = useReducer(readingListReducer, [], getInitialState);

  // Persist state to localStorage whenever readingList changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
    } catch (error) {
      console.error('Failed to persist reading list to localStorage:', error);
    }
  }, [readingList]);

  // Helper action creators
  const addBook = (book) => {
    dispatch({ type: 'ADD_BOOK', payload: book });
  };

  const removeBook = (idOrBook) => {
    dispatch({ type: 'REMOVE_BOOK', payload: idOrBook });
  };

  const clearList = () => {
    dispatch({ type: 'CLEAR_LIST' });
  };

  const isInReadingList = (bookId) => {
    return readingList.some((item) => item.id === bookId);
  };

  // Stretch goal: Merge guest localStorage reading list into account
  const mergeUserReadingList = (userSavedBooks = []) => {
    if (!Array.isArray(userSavedBooks) || userSavedBooks.length === 0) return;
    const currentIds = new Set(readingList.map((b) => b.id));
    const newItems = userSavedBooks.filter((b) => b && b.id && !currentIds.has(b.id));
    if (newItems.length > 0) {
      dispatch({ type: 'SET_LIST', payload: [...readingList, ...newItems] });
    }
  };

  const value = {
    readingList,
    count: readingList.length,
    dispatch,
    addBook,
    removeBook,
    clearList,
    isInReadingList,
    mergeUserReadingList,
  };

  return (
    <ReadingListContext.Provider value={value}>
      {children}
    </ReadingListContext.Provider>
  );
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) {
    throw new Error('useReadingList must be used within a ReadingListProvider');
  }
  return context;
}
