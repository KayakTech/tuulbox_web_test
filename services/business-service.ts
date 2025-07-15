import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import BusinessRepository, { Company, InsuranceData, LicenseData, Officer } from "@/repositories/business-repository";
import { BusinessActions } from "@/store/business-reducer";

export default class BusinessService {
    constructor(
        private businessRepository: BusinessRepository,
        private store: ToolkitStore,
        private businessActions: BusinessActions,
    ) {}

    async updateCompanyDetails(payload: Partial<Company>) {
        const res = await this.businessRepository.updateCompanyDetails(payload);
        this.store.dispatch(this.businessActions.setCompanyDetails(res.data));
        return res;
    }
    async getCompanyDetails(companyId: string) {
        const res = await this.businessRepository.getCompanyDetails(companyId);
        this.store.dispatch(this.businessActions.setCompanyDetails(res.data));
        return res;
    }
    async addOfficer(companyId: string | undefined, payload: Officer) {
        const res = await this.businessRepository.addOfficer(companyId, payload);
        return res;
    }
    async getOfficer(companyId: string | undefined, officerId: string) {
        const res = await this.businessRepository.getOfficer(companyId, officerId);
        return res;
    }
    async getOfficers(companyId: string | undefined, page: number) {
        const res = await this.businessRepository.getOfficers(companyId, page);
        return res;
    }
    async updateOfficer(companyId: string | undefined, officerId: string, payload: Partial<Officer>) {
        const res = await this.businessRepository.updateOfficer(companyId, officerId, payload);
        return res;
    }
    async deleteOfficer(companyId: string | undefined, officerId: string | undefined) {
        const res = await this.businessRepository.deleteOfficer(companyId, officerId);
        return res;
    }
    async addLicense(companyId: string | undefined, payload: LicenseData) {
        const res = await this.businessRepository.addLicense(companyId, payload);
        return res;
    }
    async getLicense(companyId: string | undefined, licenseId: string) {
        const res = await this.businessRepository.getLicense(companyId, licenseId);
        return res;
    }
    async updateLicense(companyId: string | undefined, licenseId: string | undefined, payload: Partial<LicenseData>) {
        const res = await this.businessRepository.updateLicense(companyId, licenseId, payload);
        return res;
    }
    async getLicenses(companyId: string | undefined, page: number, status?: string) {
        const res = await this.businessRepository.getLicenses(companyId, page, status);
        return res;
    }
    async deleteLicense(companyId: string | undefined, licenseId: string | undefined) {
        const res = await this.businessRepository.deleteLicense(companyId, licenseId);
        return res;
    }
    async addInsurance(companyId: string | undefined, payload: Partial<InsuranceData>) {
        const res = await this.businessRepository.addInsurance(companyId, payload);
        return res;
    }
    async getInsurance(companyId: string | undefined, insuranceId: string) {
        const res = await this.businessRepository.getInsurance(companyId, insuranceId);
        return res;
    }
    async getInsurances(companyId: string | undefined, page: number, status?: string) {
        const res = await this.businessRepository.getInsurances(companyId, page, status);
        return res;
    }
    async updateInsurance(
        companyId: string | undefined,
        insuranceId: string | undefined,
        payload: Partial<InsuranceData>,
    ) {
        const res = await this.businessRepository.updateInsurance(companyId, insuranceId, payload);
        return res;
    }
    async deleteInsurance(companyId: string | undefined, insuranceId: string | undefined) {
        const res = await this.businessRepository.deleteInsurance(companyId, insuranceId);
        return res;
    }
}
