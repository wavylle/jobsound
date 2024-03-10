import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose"

const newJobSchema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        user_email: {
            type: String,
            required: true,
        },
        title: {
            type: String,
        },
        company: {
            type: String,
        },
        workplace: {
            type: String,
        },
        location: {
            type: String,
        },
        jobtype: {
            type: String,
        },
        salary_hide: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
        },
        salary: {
            type: String,
        },
        jobdescription: {
            type: String,
        },
        skill: {
            type: Array,
        },
        questions: {
            type: Object,
        },
        recruiter_name: {
            type: String,
        },
        ai_voice: {
            type: String,
        },
        language: {
            type: String,
        },
        ai_prompt: {
            type: String,
        },
        job_id: {
            type: String,
        },
        createdAt: {
            type: Number, default: Date.now(),
        },
        publish_status: {
            type: Boolean,
            default: false,
        },


        
    }
)

export const JobDB = mongoose.model("JobDB", newJobSchema)
