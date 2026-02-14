const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Option text is required'],
        trim: true,
        maxlength: [200, 'Option text cannot exceed 200 characters'],
    },
    votes: {
        type: Number,
        default: 0,
        min: 0,
    },
});

const pollSchema = new mongoose.Schema(
    {
        pollId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        question: {
            type: String,
            required: [true, 'Poll question is required'],
            trim: true,
            maxlength: [200, 'Question cannot exceed 200 characters'],
        },
        options: {
            type: [optionSchema],
            validate: {
                validator: (v) => v.length >= 2 && v.length <= 10,
                message: 'A poll must have between 2 and 10 options',
            },
        },
        votedIps: {
            type: [String],
            default: [],
        },
        totalVotes: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Poll', pollSchema);
