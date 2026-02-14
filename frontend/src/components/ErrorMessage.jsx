export default function ErrorMessage({ message, onRetry }) {
    return (
        <div
            className="glass-card p-6 text-center animate-fade-in-up"
            style={{ maxWidth: '400px', margin: '0 auto' }}
        >
            <div
                className="text-4xl mb-4"
                style={{ filter: 'grayscale(0)' }}
            >
                ⚠️
            </div>
            <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--error)' }}
            >
                Something went wrong
            </h3>
            <p
                className="text-sm mb-4"
                style={{ color: 'var(--text-secondary)' }}
            >
                {message}
            </p>
            {onRetry && (
                <button className="btn-secondary" onClick={onRetry}>
                    ↻ Try Again
                </button>
            )}
        </div>
    );
}
