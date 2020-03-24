import * as React from 'react';

const UserContext = React.createContext({
    loggedInUid: null,
    getStoredUid: null,
    setStoredUid: null,
    deleteStoredUid: null
})

export {UserContext}
