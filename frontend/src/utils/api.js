const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const createPoll = async (question, options) => {
    const res = await fetch(`${API_BASE_URL}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Failed to create poll');
    }

    return data;
};

export const getPoll = async (pollId) => {
    const res = await fetch(`${API_BASE_URL}/api/polls/${pollId}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch poll');
    }

    return data;
};

export const votePoll = async (pollId, optionId) => {
    const res = await fetch(`${API_BASE_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Failed to vote');
    }

    return data;
};

export const getStreamUrl = (pollId) => {
    return `${API_BASE_URL}/api/polls/${pollId}/stream`;
};
