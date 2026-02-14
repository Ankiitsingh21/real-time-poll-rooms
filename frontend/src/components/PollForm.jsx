import { useState } from 'react';

export default function PollForm({ onSubmit, loading }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState('');

    const addOption = () => {
        if (options.length >= 10) {
            setError('Maximum 10 options allowed');
            return;
        }
        setOptions([...options, '']);
        setError('');
    };

    const removeOption = (index) => {
        if (options.length <= 2) {
            setError('At least 2 options are required');
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
        setError('');
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const trimmedQuestion = question.trim();
        if (!trimmedQuestion) {
            setError('Please enter a question');
            return;
        }

        if (trimmedQuestion.length > 200) {
            setError('Question must be 200 characters or less');
            return;
        }

        const cleanedOptions = options
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0);

        if (cleanedOptions.length < 2) {
            setError('Please provide at least 2 non-empty options');
            return;
        }

        const uniqueOptions = [...new Set(cleanedOptions.map((o) => o.toLowerCase()))];
        if (uniqueOptions.length !== cleanedOptions.length) {
            setError('Duplicate options are not allowed');
            return;
        }

        onSubmit(trimmedQuestion, cleanedOptions);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Question Input */}
            <div className="mb-7">
                <label
                    className="block text-xs font-semibold mb-2.5 tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
                >
                    Your Question
                </label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. What should we have for lunch?"
                    value={question}
                    onChange={(e) => {
                        setQuestion(e.target.value);
                        setError('');
                    }}
                    maxLength={200}
                    disabled={loading}
                    style={{ fontSize: '15px', padding: '16px 20px' }}
                />
                <div className="flex justify-end mt-1.5">
                    <span
                        className="text-xs"
                        style={{
                            color: question.length > 180 ? 'var(--warning)' : 'var(--text-muted)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        {question.length}/200
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Options */}
            <div className="mb-7">
                <label
                    className="block text-xs font-semibold mb-3 tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
                >
                    Answer Options
                </label>
                <div className="flex flex-col gap-2.5">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2.5 animate-fade-in-scale"
                            style={{ animationDelay: `${index * 0.04}s` }}
                        >
                            <span
                                className="flex-shrink-0 flex items-center justify-center"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    color: 'var(--accent-purple)',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                }}
                            >
                                {index + 1}
                            </span>
                            <input
                                type="text"
                                className="input-field flex-1"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                maxLength={200}
                                disabled={loading}
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => removeOption(index)}
                                    disabled={loading}
                                    title="Remove option"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {options.length < 10 && (
                    <button
                        type="button"
                        className="btn-secondary w-full mt-3"
                        onClick={addOption}
                        disabled={loading}
                        style={{ borderStyle: 'dashed' }}
                    >
                        + Add Option
                    </button>
                )}
            </div>

            {/* Error */}
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

            {/* Submit */}
            <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
                style={{ padding: '16px 30px', fontSize: '15px' }}
            >
                {loading ? (
                    <>
                        <span
                            className="animate-spin"
                            style={{
                                display: 'inline-block',
                                width: '18px',
                                height: '18px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                            }}
                        />
                        Creating Poll...
                    </>
                ) : (
                    '🚀 Create Poll'
                )}
            </button>
        </form>
    );
}
