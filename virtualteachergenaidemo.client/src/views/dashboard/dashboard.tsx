import "./dashboard.css";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatHistory, { IChat } from '../../components/dashboard/chatHistory';
import { ArrowCircleLeft48Filled } from '@fluentui/react-icons';
import { Button } from '@fluentui/react-button';
import DashboardTabs from '../../components/dashboard/dashboardTabs';
import { useUsername } from '../../auth/UserContext';
import DashboardService from '../../services/DashboardService';
import { useLocalization } from '../../contexts/LocalizationContext';
import { SessionService } from '../../services/SessionService';
import { DeleteSessionRequest } from '../../models/Request/DeleteSessionRequest';
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions } from '@fluentui/react-components';
import { Spinner } from '@fluentui/react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { tokens } from '@fluentui/tokens';

const useStyles = makeStyles({
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        ...shorthands.margin('10px'),
    },
    deleteButton: {
        backgroundColor: tokens.colorPaletteRedBackground3,
        color: "white",
        ':hover': {
            backgroundColor: tokens.colorPaletteRedForeground1,
            color: 'white',
        },
    },
    spinnerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

enum AuthorRoles {
    User = 0,
    Assistant = 1,
}

function Dashboard() {
    const styles = useStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId, scenarioTitle, roleAgent } = location.state;
    const [conversation, setConversation] = useState<IChat[]>([]);
    const [formattedConversation, setFormattedConversation] = useState<string>("");
    const userName = useUsername();
    const { getTranslation } = useLocalization();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleBackClick = () => {
        navigate('/lastTraining');
    };

    useEffect(() => {
        getConversation(sessionId);
    }, [sessionId]);

    const getConversation = async (sessionId: string) => {
        const data = await DashboardService.getConversation(sessionId);
        const formattedConversation = data.map((message: any) => {
            const role = message.authorRole === AuthorRoles.User ? getTranslation("SellerRole") : getTranslation("ClientRole");
            return `${role}: ${message.content}`;
        }).join("\n");
        setConversation(data);
        setFormattedConversation(formattedConversation);
    };

    const handleDeleteSession = async () => {
        setIsProcessing(true);
        const deleteRequest = new DeleteSessionRequest(sessionId, userName);
        try {
            await SessionService.deleteSession(deleteRequest);
            navigate('/lastTraining');
        } catch (error) {
            console.error('Error deleting session:', error);
        } finally {
            setIsProcessing(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleOpenChange = (_event: any, data: { open: boolean }) => {
        setIsDeleteConfirmOpen(data.open);
    };

    return (

        <div className="grid-container">
           
            <div className="header">
                <section className="intro">
                    <div className="back">
                        <Button size="large" appearance="transparent" onClick={handleBackClick} icon={<ArrowCircleLeft48Filled />} />
                    </div>
                    <div className="htitle">
                        <h1>{getTranslation("DashboardTitle")}</h1>
                        <div className="additional-info">
                            <p className='intro'><strong>Scenario:</strong> {scenarioTitle} / <strong>Role:</strong> {roleAgent}</p>
                        </div>
                    </div>
                    <p className="intro">
                        {getTranslation("DashboardIntro")}
                    </p>
                </section>
            </div>
            <div className="chat">
                <div className="chatHistoryTitle">{getTranslation("ConversationTitle")}</div>
                <ChatHistory conversation={conversation} />
            </div>
            <div className="dashboard">                
                <DashboardTabs sessionId={sessionId} conversation={formattedConversation} userName={userName} />
                <div className={styles.buttonContainer}>
                    <Button className={styles.deleteButton} onClick={() => setIsDeleteConfirmOpen(true)}>{getTranslation("DeleteSession")}</Button>
                </div>
            </div>
          

            <Dialog open={isDeleteConfirmOpen} onOpenChange={handleOpenChange}>
                <DialogSurface>
                    <DialogBody>
                        {isProcessing && <div className={styles.spinnerOverlay}><Spinner label={getTranslation("Processing")} /></div>}
                        <DialogTitle>{getTranslation("DeleteAskTitle")}</DialogTitle>
                        <DialogContent>
                            <p>{getTranslation("DeleteSessionAskMessage")}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button className={styles.deleteButton} onClick={handleDeleteSession} disabled={isProcessing}>
                                {getTranslation("DeleteButton")}
                            </Button>
                            <Button appearance="secondary" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isProcessing}>
                                {getTranslation("CancelButton")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}

export default Dashboard;
