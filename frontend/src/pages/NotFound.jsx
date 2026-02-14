import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="page-container">
            <div className="glass-card p-10 text-center animate-fade-in-up" style={{ maxWidth: '440px' }}>
                <div className="text-6xl mb-5">🔍</div>
                <h1
                    className="text-2xl font-bold mb-3"
                    style={{
                        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Poll Not Found
                </h1>
                <p
                    className="text-sm mb-6"
                    style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
                >
                    This poll doesn't exist or has been removed. Double-check the URL or create a new poll.
                </p>
                <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
                    ← Create a New Poll
                </Link>
            </div>
        </div>
    );
}
