interface ValidationOptions {
    showAlert?: boolean;
    sizeInKbAllowed?: number;
    allowedTypes?: string[];
    heightOfImage?: number;
    widthOfImage?: number;
    pdfPageMinCount?: number;
    pdfPageMaxCount?: number;
    messages?: {
        noFile?: string;
        fileSize?: string;
        fileType?: string;
        dimensions?: string;
        invalidPdf?: string;
        pdfPageCount?: string;
    };
    customValidations?: {
        image?: Array<(file: File, image: HTMLImageElement) => boolean | string>;
        pdf?: Array<(file: File, pdfData: Uint8Array, pdfText: string) => boolean | string>;
    };
}
declare const useFileValidation: (userOptions?: ValidationOptions) => {
    validateFile: (file: File) => Promise<File>;
    error: string | null;
};
export default useFileValidation;
