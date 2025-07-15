import { InsuranceData } from "@/repositories/business-repository";
import ContactRepository, { Contact } from "@/repositories/contact-repositories";
import { Subcontractor } from "@/repositories/subcontractor-repository";

export default class AccountServices {
    constructor(private contactRepository: ContactRepository) {}

    async getContacts(page: number) {
        const res = await this.contactRepository.getContacts(page);
        return res;
    }

    async getContact(contactId: string) {
        const res = await this.contactRepository.getContact(contactId);
        return res;
    }

    addContact(contact: Partial<any>) {
        if (contact.isSubcontractor) {
            const payload = {
                contact: {
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    phoneNumber: contact.phoneNumber,
                    email: contact.email,
                    company: contact.company,
                    addressLine1: contact.addressLine1,
                    addressLine2: contact.addressLine2,
                    country: contact.country,
                    state: contact.state,
                    city: contact.city,
                    zipCode: contact.zipCode,
                },
                certificatesIds: contact.certificatesIds,
                hasTaxDocuments: contact.hasTaxDocuments,
                taxId: contact.taxId,
                licenses: contact.licenses,
                insurances: contact.insurances,
            };

            // delete payload.contact.insurances;
            // delete payload.contact.licenses;
            return this.addSubcontractor(payload);
        }
        delete contact.insurances;
        delete contact.licenses;
        delete contact.countryCode;
        delete contact.address;
        delete contact.hasTaxDocuments;
        delete contact.certificatesIds;
        delete contact.taxId;
        delete contact.taxDocuments;
        delete contact.isSubcontractor;
        delete contact.certificates;
        delete contact.taxDocumentName;

        return this.contactRepository.addContact(contact);
    }

    updateContact(payload: Partial<Contact>, contactId: string) {
        if (payload.isSubcontractor && payload.subcontractorId) {
            payload = {
                contactId: payload.id,
                certificatesIds: payload.certificatesIds,
                hasTaxDocuments: payload.hasTaxDocuments,
                taxId: payload.taxId,
            };
            return this.addSubcontractor(payload);
        }
        return this.contactRepository.updateContact(payload, contactId);
    }

    addSubcontractor(payload: Partial<Contact>) {
        return this.contactRepository.addSubcontractor(payload);
    }

    updateSubcontractor(contact: Partial<Contact>) {
        if (contact.certificates?.length && contact.taxDocumentName?.length) {
            contact.certificates[0].certificate.originalFileName = contact.taxDocumentName;
        }

        const payload: any = {
            contact,
            certificatesIds: contact.certificatesIds,
            hasTaxDocuments: contact.hasTaxDocuments,
            taxId: contact.taxId,
            licenses: contact.licenses,
            insurances: contact.insurances,
        };
        return this.contactRepository.updateSubcontractor(payload);
    }

    updateSubcontractorInsurance(subcontractorId: string, insuranceId: string, payload: Partial<InsuranceData>) {
        return this.contactRepository.updateSubcontractorInsurance(subcontractorId, insuranceId, payload);
    }

    async deleteContact(contactId: string) {
        const res = await this.contactRepository.deleteContact(contactId);
        return res;
    }
}
