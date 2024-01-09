import { Unsubscribe } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { observeAuth } from './firebase/authentication';
import GlobalContext from './context/global';
import Alert from './components/centralize/Alert';
import LoadingScreen from './components/centralize/LoadingScreen';
import Topbar from './components/layout/Topbar';
import { Alert as AlertModel } from './models/alert';
import { Poker } from './models/poker';
import { UserProfile } from './models/user';
import { getUserProfile, watchUser } from './repository/firestore/user';
import Router from "./router/router";
import { randomString } from './utils/generator';

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: ['Comic Neue', 'cursive', 'Noto Sans Thai'].join(','),
      button: {
        textTransform: 'none'
      },
    },
  })

  const location = useLocation();

  const [sessionID] = useState(randomString(20));
  const [isLoading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertModel>({isShow: false, message: '', severity: 'info'});
  const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', displayName: ''});
  const [poker, setPoker] = useState<Poker>();
  const [isPageReady, setPageReady] = useState(false);

  useMemo(async () => {
    let userProfile!: UserProfile;
    await new Promise(resolve => {
      let unsubUser: Unsubscribe;
      observeAuth(async (user) => {
        if (!user) {
          return;
        }
        if (unsubUser) {
          unsubUser();
        }
        userProfile = (await getUserProfile())!;
        if (userProfile) {
          if (userProfile.isAnonymous) {
            setProfile(userProfile)
          } else {
            unsubUser = await watchUser(userProfile.userUUID, userProfile => setProfile(userProfile));
          }
          resolve('get profile succeeded');
        }
      });
    })
    setPageReady(true);
  }, []);

  useEffect(() => {
    if (!isPageReady) {
      return;
    }
  }, [isPageReady, profile]);

  // Clear poker data for re-render topbar
  useEffect(() => {
    const paths = location.pathname.split('/');
    if (paths.length !== 2 || paths[1].length === 0) {
      setPoker(undefined);
    }
  }, [location.pathname])

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider value={{sessionID, profile, alert: (alert => setAlert({...alert, isShow: true})), isLoading, setLoading, poker, setPoker, isPageReady}}>
          <Alert isShowAlert={alert.isShow} message={alert.message} severity={alert.severity} onDismiss={() => setAlert({...alert, isShow: false})} />
          <LoadingScreen isLoading={isLoading} />
          <Topbar />
          <div className="relative w-screen top-20 min-h-100 overflow-y-auto bg-white">
            <Router />
          </div>
        </GlobalContext.Provider>
      </ThemeProvider>
    </>
  )
}

export default App
