import account from '../../config/account.json';
import kis from '../../config/query/kis.json';
import qa from '../../config/query/qa.json';
import trake from '../../config/query/trake.json';
import api from './axios';

export async function getSessionID() {
  try {
    const response = await api.post('/login', {
      username: account.username,
      password: account.password,
    });
    console.log("session response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

export async function getEvaluationID(sessionId: string) {
    try {
        const response = await api.get('/client/evaluation/list', {
            params: {
                session: sessionId
            }
        });
        console.log("evaluation response:", response.data[0]);
        return response.data[0];
    } catch (error) {
        console.error('Error fetching evaluation ID:', error);
        throw error;
    }
}

export async function submitKIS(
    sessionId: string,
    evaluationId: string,
    videoId: string,
    start: number,
    end: number
) {
    try {
        const payload = JSON.parse(JSON.stringify(kis));
        payload.answerSets[0].answers[0].mediaItemName = videoId;
        payload.answerSets[0].answers[0].start = start;
        payload.answerSets[0].answers[0].end = end;

        const response = await api.post(`/submit/${evaluationId}`, payload, {
            params: {
                sessionId: sessionId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data.sessionId;
    } catch (error) {
        console.error('Error submitting KIS data:', error);
        throw error;
    }
}

export async function submitQA(
    sessionId: string,
    evaluationId: string,
    videoId: string,
    time: number,
    answer: string
) {
    try {
        const payload = JSON.parse(JSON.stringify(qa));
        payload.answerSets[0].answers[0].text = payload.answerSets[0].answers[0].text
            .replace("<ANSWER>", answer)
            .replace("<VIDEO_ID>", videoId)
            .replace("<TIME(ms)>", time.toString());
        const response = await api.post(`/submit/${evaluationId}`, payload, {
            params: {
                sessionId: sessionId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.Id;
    } catch (error) {
        console.error('Error submitting QA data:', error);
        throw error;
    }
}

export async function submitTRAKE(
    sessionId: string,
    evaluationId: string,
    videoId: string,
    frameIDs: number[],
) {
    try {
        const payload = JSON.parse(JSON.stringify(trake));
        payload.answerSets[0].answers[0].mediaItemName = videoId;
        
        const framesString = frameIDs.join(",");

        payload.answerSets[0].answers[0].text = payload.answerSets[0].answers[0].text
            .replace("<VIDEO_ID>", videoId)
            .replace("<FRAME_ID1>,<FRAME_ID2>,...", framesString);

        const response = await api.post(`/submit/${evaluationId}`, payload, {
            params: {
                sessionId: sessionId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting TRAKE data:', error);
        throw error;
    }
}
