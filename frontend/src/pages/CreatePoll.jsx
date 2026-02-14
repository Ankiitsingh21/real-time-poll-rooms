import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PollForm from '../components/PollForm';
import { createPoll } from '../utils/api';

export default function CreatePoll() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async (question, options) => {
        setLoading(true);
        setError('');

        try {
            const data = await createPoll(question, options);
            navigate(`/poll/${data.pollId}`);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="w-full" style={{ maxWidth: '540px' }}>
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div
                        className="badge mb-5"
                        style={{
                            background: 'rgba(139, 92, 246, 0.08)',
                            border: '1px solid rgba(139, 92, 246, 0.18)',
                            color: 'var(--accent-purple)',
                            display: 'inline-flex',
                        }}
                    >
                        ⚡ Real-Time Voting
                    </div>
                    <h1
                        className="text-4xl font-extrabold mb-3 tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: '1.15',
                        }}
                    >
                        Create a Live Poll
                    </h1>
                    <p
                        className="text-base"
                        style={{ color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '400px', margin: '0 auto' }}
                    >
                        Ask a question, share the link, and watch the votes roll in — live.
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card animate-fade-in-up animate-delay-2" style={{ padding: '36px' }}>
                    {error && (
                        <div
                            className="text-sm mb-5 animate-fade-in-scale"
                            style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.18)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <PollForm onSubmit={handleCreate} loading={loading} />
                </div>

                {/* Footer */}
                <p
                    className="text-center mt-7 animate-fade-in-up animate-delay-3"
                    style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.01em' }}
                >
                    🔒 No sign-up required · Polls are anonymous & public
                </p>
            </div>
        </div>
    );
}
