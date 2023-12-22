import '../styles/globals.css';

import Head from 'next/head';
import { Provider} from 'react-redux';

import { useRouter } from 'next/router';
import user from '../reducers/users';

import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import HeaderBar from '../components/Header/HeaderBar';

const reducers = combineReducers({ user });

const persistConfig = { key: 'stockify', storage };

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store); 


function App({ Component, pageProps }) {
  
  const router = useRouter();
  const isLoginPage = router.pathname === '/';


  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Head>
        </Head>

        {!isLoginPage && (

          <HeaderBar />
          
        )}
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default App;
