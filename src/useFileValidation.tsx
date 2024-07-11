import { useState, useCallback } from 'react';

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

const defaultOptions: Required<ValidationOptions> = {
    showAlert: false,
    sizeInKbAllowed: 10240, // Default to 10 MB
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    heightOfImage: 2000, // Default maximum height for images
    widthOfImage: 2000, // Default maximum width for images
    pdfPageMinCount: 1, // Minimum PDF page count
    pdfPageMaxCount: 10, // Maximum PDF page count
    messages: {
        noFile: "No file selected.",
        fileSize: "File size exceeds the allowed limit.",
        fileType: "Invalid file type.",
        dimensions: "Invalid image dimensions.",
        invalidPdf: "Invalid PDF file.",
        pdfPageCount: "PDF does not meet the required page count."
    },
    customValidations: {
        image: [],
        pdf: [],
    },
};

const useFileValidation = (userOptions: ValidationOptions = {}) => {
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File) => {
        const options = { ...defaultOptions, ...userOptions };

        return new Promise<File>((resolve, reject) => {
            if (!file) {
                const message = options.messages.noFile ?? 'No file selected';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }

            const fileSize = file.size / 1024;
            if (fileSize > options.sizeInKbAllowed) {
                const message = options.messages.fileSize ?? 'File size exceeds the allowed limit';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }

            if (!options.allowedTypes.includes(file.type)) {
                const message = options.messages.fileType ?? 'Invalid file type';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }

            if (file.type === "application/pdf") {
                // PDF Validation
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = (event) => {
                    const pdfData = new Uint8Array(event.target!.result as ArrayBuffer);
                    const pdfText = new TextDecoder().decode(pdfData);
                    const isPDF = pdfText.includes("%PDF-");
                    if (!isPDF) {
                        const message = options.messages.invalidPdf ?? 'Invalid PDF file';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }

                    // Extract the page count
                    const pageCountMatches = pdfText.match(/\/Count\s+(\d+)/g) as string[] || [];
                    const pageCount = pageCountMatches.reduce((count: number, match: string) => {
                        const matchCount = parseInt(match.split(' ')[1], 10);
                        return Math.max(count, matchCount);
                    }, 0);

                    if (
                        pageCount < options.pdfPageMinCount ||
                        pageCount > options.pdfPageMaxCount
                    ) {
                        const message = options.messages.pdfPageCount ?? 'PDF does not meet the required page count';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }

                    const eofIndex = pdfText.lastIndexOf("%%EOF");
                    if (eofIndex === -1) {
                        const message = options.messages.invalidPdf ?? 'Invalid PDF file';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }

                    if (options.customValidations.pdf) {
                        // Apply PDF-specific custom validations
                        for (const validation of options.customValidations.pdf) {
                            const validationResult = validation(file, pdfData, pdfText);
                            if (validationResult !== true) {
                                const message = typeof validationResult === 'string' ? validationResult : 'Custom PDF validation failed';
                                if (options.showAlert) {
                                    alert(message);
                                }
                                setError(message);
                                reject(message);
                                return;
                            }
                        }
                    }

                    resolve(file);
                };
                reader.onerror = () => {
                    const message = options.messages.invalidPdf ?? 'Invalid PDF file';
                    if (options.showAlert) {
                        alert(message);
                    }
                    setError(message);
                    reject(message);
                };
            } else if (file.type.startsWith("image/")) {
                // Image Validation
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const image = new Image();
                    image.src = event.target!.result as string;
                    image.onload = function () {
                        const height = (this as HTMLImageElement).height;
                        const width = (this as HTMLImageElement).width;
                        if (
                            height > options.heightOfImage ||
                            width > options.widthOfImage
                        ) {
                            const message = options.messages.dimensions ?? 'Invalid image dimensions';
                            if (options.showAlert) {
                                alert(message);
                            }
                            setError(message);
                            reject(message);
                        } else {
                            // Apply image-specific custom validations
                            if (options.customValidations.image) {
                                for (const validation of options.customValidations.image) {
                                    const validationResult = validation(file, this as HTMLImageElement);
                                    if (validationResult !== true) {
                                        const message = typeof validationResult === 'string' ? validationResult : 'Custom image validation failed';
                                        if (options.showAlert) {
                                            alert(message);
                                        }
                                        setError(message);
                                        reject(message);
                                        return;
                                    }
                                }
                            }
                            resolve(file); // Ensure resolve is called when custom validations pass
                        }
                    };
                };
            } else {
                // Unsupported file type
                const message = options.messages.fileType ?? 'Invalid file type';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
            }
        });
    }, [userOptions]);

    return { validateFile, error };
};

export default useFileValidation;
