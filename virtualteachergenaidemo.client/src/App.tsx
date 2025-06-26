import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home';
import LastTraining from './views/trainingList/lastTraining';
import Dashboard from './views/dashboard/dashboard';
import Coach from './views/coach/coach';
import Agent from './views/agent/agent';
import Scenario from './views/scenario/scenario';
import Training from './views/training/training';
import Session from './views/session/session';
import { MsalProvider, MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import { initializeMsal } from './auth/msalConfig';
import { PublicClientApplication } from '@azure/msal-browser';
import { InteractionType } from '@azure/msal-browser';
import UserDisplay from './auth/userDisplay';
import { UserProvider } from './auth/UserContext';
import { UserRoleProvider, useUserRole } from './auth/UserRoleContext';
import { getUserRole, createUser } from './services/userService';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import { Select } from '@fluentui/react-components';

// Add this constant or get it from config/env as needed
const enableAAD = false; // Set to false to disable AAD authentication

function App(props: any) {
    const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
    const [language, setLanguage] = useState('fr-FR');
    const [aadReady, setAadReady] = useState(!enableAAD);

    useEffect(() => {
        if (enableAAD) {
            const initMsal = async () => {
                const instance = await initializeMsal();
                setMsalInstance(instance);
                setAadReady(true);
            };
            initMsal();
        }
    }, []);

    if (enableAAD && (!msalInstance || !aadReady)) {
        return <div>Loading...</div>;
    }

    const appContent = (
        <UserProvider>
            <UserRoleProvider>
                <LocalizationProvider lang={language}>
                    <AuthenticatedApp title={props.title} language={language} setLanguage={setLanguage} enableAAD={enableAAD} />
                </LocalizationProvider>
            </UserRoleProvider>
        </UserProvider>
    );

    if (enableAAD) {
        return <MsalProvider instance={msalInstance!}>{appContent}</MsalProvider>;
    } else {
        return appContent;
    }
}

function AuthenticatedApp(props: any) {
    // If AAD is enabled, use MSAL hooks, otherwise use guest
    let userName = 'Guest';
    let email = 'Guest';
    const { setRole } = useUserRole();
    const { getTranslation } = useLocalization();

    let accounts: any[] = [];
    if (props.enableAAD) {
        try {
            // useMsal will throw if not under MsalProvider
            // eslint-disable-next-line react-hooks/rules-of-hooks
            accounts = useMsal().accounts;
            userName = accounts.length > 0 ? accounts[0].name : 'Guest';
            email = accounts.length > 0 ? accounts[0].username : 'Guest';
        } catch {}
    }

    useEffect(() => {
        const fetchUserRole = async () => {
            if (email) {
                try {
                    let userData = await getUserRole(email);
                    if (!userData) {
                        userData = await createUser(email);
                    }
                    setRole(userData.role);

                    const userLanguageSetting = userData.settings.find((setting: any) => setting.language);
                    if (userLanguageSetting) {
                        props.setLanguage(userLanguageSetting.language);
                    }
                } catch (error) {
                    console.error('Error fetching or creating user:', error);
                }
            }
        };
        fetchUserRole();
    }, [email, setRole]);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.setLanguage(event.target.value);
    };

    const routes = (
        <Routes>
            <Route path="/" element={<Home title={props.title} />} />
            <Route path="/training" element={<Training />} />
            <Route path="/session" element={<Session />} />
            <Route path="/lastTraining" element={<LastTraining />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/scenarios" element={<Scenario title={getTranslation("ScenarioTitle")} isForSimulation={false} />} />
        </Routes>
    );

    return (
        <Router>
            {props.enableAAD ? (
                <MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label htmlFor="language-select" style={{ marginRight: 10 }}>Select Language</label>
                        <Select
                            id="language-select"
                            value={props.language}
                            onChange={handleLanguageChange}
                            style={{ marginRight: 10 }}
                        >
                            <option value="fr-FR">French</option>
                            <option value="en-US">English</option>
                        </Select>
                        <UserDisplay userName={userName} />
                    </div>
                    {routes}
                </MsalAuthenticationTemplate>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label htmlFor="language-select" style={{ marginRight: 10 }}>Select Language</label>
                        <Select
                            id="language-select"
                            value={props.language}
                            onChange={handleLanguageChange}
                            style={{ marginRight: 10 }}
                        >
                            <option value="fr-FR">French</option>
                            <option value="en-US">English</option>
                        </Select>
                        <UserDisplay userName={userName} />
                    </div>
                    {routes}
                </>
            )}
        </Router>
    );
}

export default App;
