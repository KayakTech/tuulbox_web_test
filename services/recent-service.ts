import RecentRepository from "@/repositories/recent-repository";
export default class RecentService {
    constructor(private recentRepository: RecentRepository) {}

    async getRecentActivities(page: number) {
        const res = await this.recentRepository.getRecentActivities(page);
        return res;
    }

    async deleteRecentActivity(recentActivityId: number | string) {
        const res = await this.recentRepository.delteRecentActivity(recentActivityId);
        return res;
    }
}
