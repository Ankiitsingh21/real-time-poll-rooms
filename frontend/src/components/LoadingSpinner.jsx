export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} border-white/20 border-t-purple-500 rounded-full animate-spin`}
                style={{ borderWidth: size === 'sm' ? '2px' : '3px' }}
            />
            {text && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {text}
                </p>
            )}
        </div>
    );
}
