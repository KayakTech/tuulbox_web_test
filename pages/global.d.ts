declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
        webkitSpeechRecognition: typeof SpeechRecognition;
        SpeechRecognition: typeof SpeechRecognition;
    }
    interface SpeechRecognitionEvent extends Event {
        results: {
            [key: number]: {
                [key: number]: {
                    transcript: string;
                };
            };
        };
    }
    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new (): SpeechRecognition;
    };
}
export {};
