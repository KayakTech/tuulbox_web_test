import FeedbackRepository, { FeedbackPayload } from "@/repositories/feedback-repository";

export default class FeedbackService {
    constructor(private feedbackRepository: FeedbackRepository) {}

    async sendFeedback(payload: Partial<FeedbackPayload>) {
        const res = await this.feedbackRepository.sendFeedback(payload);
        return res;
    }
}
