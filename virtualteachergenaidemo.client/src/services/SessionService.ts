import axios from 'axios';
import { SessionItem } from '../models/SessionItem';
import { DeleteSessionRequest } from '../models/Request/DeleteSessionRequest';

export class SessionService {
    static async getIncompleteSessions(userName: string) {
        return axios.get<SessionItem[]>(`/api/Session/NotCompleted/${userName}`);
    }

    static async getSessionHistory(userName: string) {
        return axios.get<SessionItem[]>(`/api/Session/history/${userName}`);
    }

    static async deleteSession(request: DeleteSessionRequest) {
        return axios.delete('/api/Session/delete', { data: request });
    }
}
