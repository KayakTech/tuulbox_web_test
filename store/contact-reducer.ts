import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Contact } from "@/repositories/contact-repositories";

interface ContactState {
    userId: string | null;
    contacts: {
        data: Contact[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
        currentPage: number;
    };
    contactDetails: {
        [contactId: string]: {
            contact: Contact;
            lastFetched: number;
        };
    };
    isSilentlyFetching: boolean;
}

const initialState: ContactState = {
    userId: null,
    contacts: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
        currentPage: 1,
    },
    contactDetails: {},
    isSilentlyFetching: false,
};

export const contactSlice = createSlice({
    name: "contacts",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.contacts = initialState.contacts;
                state.contactDetails = {};
            }
        },
        setContacts: (
            state,
            action: PayloadAction<{
                data: Contact[];
                count: number;
                next: string | null;
                page: number;
                append?: boolean;
            }>,
        ) => {
            const { data, count, next, page, append = false } = action.payload;

            if (append && page > 1) {
                state.contacts.data = [...state.contacts.data, ...data];
            } else {
                state.contacts.data = data;
            }

            state.contacts.count = count;
            state.contacts.next = next;
            state.contacts.currentPage = page;
            state.contacts.lastFetched = Date.now();
        },
        setContactsLoading: (state, action: PayloadAction<boolean>) => {
            state.contacts.loading = action.payload;
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        setContactDetails: (
            state,
            action: PayloadAction<{
                contactId: string;
                contact: Contact;
            }>,
        ) => {
            const { contactId, contact } = action.payload;
            state.contactDetails[contactId] = {
                contact,
                lastFetched: Date.now(),
            };
        },
        updateContact: (state, action: PayloadAction<Contact>) => {
            const updatedContact = action.payload;

            const contactIndex = state.contacts.data.findIndex(contact => contact.id === updatedContact.id);
            if (contactIndex !== -1) {
                state.contacts.data[contactIndex] = updatedContact;
            }
            //@ts-ignore
            if (state.contactDetails[updatedContact.id]) {
                //@ts-ignore
                state.contactDetails[updatedContact.id] = {
                    contact: updatedContact,
                    lastFetched: Date.now(),
                };
            }
        },
        addContact: (state, action: PayloadAction<Contact>) => {
            const newContact = action.payload;

            // Add to the beginning of contacts list
            state.contacts.data.unshift(newContact);
            state.contacts.count += 1;

            // Add to contact details
            //@ts-ignore
            state.contactDetails[newContact.id] = {
                contact: newContact,
                lastFetched: Date.now(),
            };
        },
        deleteContact: (state, action: PayloadAction<string>) => {
            const contactId = action.payload;

            // Remove from contacts list
            state.contacts.data = state.contacts.data.filter(contact => contact.id !== contactId);
            if (state.contacts.count > 0) {
                state.contacts.count -= 1;
            }

            // Remove from contact details
            delete state.contactDetails[contactId];
        },
        resetContacts: state => {
            state.contacts = initialState.contacts;
        },
        resetContactDetails: (state, action: PayloadAction<string>) => {
            const contactId = action.payload;
            delete state.contactDetails[contactId];
        },
        // Clear all contact data on logout
        clearContactStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setContacts,
    setContactsLoading,
    setSilentlyFetching,
    setContactDetails,
    updateContact,
    addContact,
    deleteContact,
    resetContacts,
    resetContactDetails,
    clearContactStore,
} = contactSlice.actions;

export default contactSlice.reducer;
